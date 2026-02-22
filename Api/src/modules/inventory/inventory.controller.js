const { sql, poolPromise } = require('../../../config/db');

const getInventory = async (req, res) => {
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT * FROM InventoryItems WHERE LodgeId = @lodgeId');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getVendors = async (req, res) => {
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT VendorId, VendorName FROM Vendors WHERE LodgeId = @lodgeId ORDER BY VendorName');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addTransaction = async (req, res) => {
    const { inventoryItemId, transactionType, quantity, unitPrice, vendorId } = req.body;
    const { lodgeId, userId } = req.user;

    if (!['PURCHASE', 'ISSUE', 'DAMAGE', 'ADJUSTMENT'].includes(transactionType)) {
        return res.status(400).json({ message: 'Invalid transaction type.' });
    }

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Check current stock if OUT
            const itemResult = await transaction.request()
                .input('lodgeId', sql.Int, lodgeId)
                .input('itemId', sql.Int, inventoryItemId)
                .query('SELECT CurrentStock FROM InventoryItems WHERE InventoryItemId = @itemId AND LodgeId = @lodgeId');

            if (itemResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Inventory item not found.' });
            }

            const currentStock = itemResult.recordset[0].CurrentStock;

            if (['ISSUE', 'DAMAGE'].includes(transactionType) && currentStock < quantity) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Insufficient stock for this transaction.' });
            }

            // Update InventoryItems
            const stockChange = ['PURCHASE', 'ADJUSTMENT'].includes(transactionType) ? quantity : -quantity;
            await transaction.request()
                .input('lodgeId', sql.Int, lodgeId)
                .input('itemId', sql.Int, inventoryItemId)
                .input('stockChange', sql.Int, stockChange)
                .query(`
                    UPDATE InventoryItems 
                    SET CurrentStock = CurrentStock + @stockChange 
                    WHERE InventoryItemId = @itemId AND LodgeId = @lodgeId
                `);

            // Insert into InventoryTransactions
            await transaction.request()
                .input('lodgeId', sql.Int, lodgeId)
                .input('itemId', sql.Int, inventoryItemId)
                .input('vendorId', sql.Int, vendorId || null)
                .input('type', sql.NVarChar, transactionType)
                .input('quantity', sql.Int, quantity)
                .input('unitPrice', sql.Decimal, unitPrice || 0)
                .input('createdBy', sql.Int, userId || 1) // Provide default fallback if userId isn't in token yet
                .query(`
                    INSERT INTO InventoryTransactions (LodgeId, InventoryItemId, VendorId, TransactionType, Quantity, UnitPrice, TransactionDate, CreatedBy)
                    VALUES (@lodgeId, @itemId, @vendorId, @type, @quantity, @unitPrice, GETDATE(), @createdBy)
                `);

            await transaction.commit();
            res.status(201).json({ message: 'Transaction successful' });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        console.error('Inventory transaction error:', err);
        res.status(500).json({ message: 'Error processing transaction.' });
    }
};

const createItem = async (req, res) => {
    const { itemCode, itemName, category, unitOfMeasure, reorderLevel, initialStock } = req.body;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;

        // Auto-generate code if not provided
        let code = itemCode;
        if (!code) {
            const codeResult = await pool.request()
                .input('lodgeId', sql.Int, lodgeId)
                .query('SELECT COUNT(*) as count FROM InventoryItems WHERE LodgeId = @lodgeId');
            code = `INV${lodgeId}-${codeResult.recordset[0].count + 1}`;
        }

        await pool.request()
            .input('lodgeId', sql.Int, lodgeId)
            .input('itemCode', sql.NVarChar, code)
            .input('itemName', sql.NVarChar, itemName)
            .input('category', sql.NVarChar, category || null)
            .input('unitOfMeasure', sql.NVarChar, unitOfMeasure || null)
            .input('reorderLevel', sql.Int, reorderLevel || 0)
            .input('currentStock', sql.Int, initialStock || 0)
            .query(`
                INSERT INTO InventoryItems (LodgeId, ItemCode, ItemName, Category, UnitOfMeasure, ReorderLevel, CurrentStock)
                VALUES (@lodgeId, @itemCode, @itemName, @category, @unitOfMeasure, @reorderLevel, @currentStock)
            `);

        res.status(201).json({ message: 'Inventory item created successfully', itemCode: code });
    } catch (err) {
        console.error('Error creating inventory item:', err);
        res.status(500).json({ message: 'Error creating inventory item' });
    }
};

const updateItem = async (req, res) => {
    const { id } = req.params;
    const { itemCode, itemName, category, unitOfMeasure, reorderLevel } = req.body;
    const { lodgeId } = req.user;

    try {
        const pool = await poolPromise;

        // Verify item exists for lodge
        const checkResult = await pool.request()
            .input('itemId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .query('SELECT InventoryItemId FROM InventoryItems WHERE InventoryItemId = @itemId AND LodgeId = @lodgeId');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await pool.request()
            .input('itemId', sql.Int, id)
            .input('lodgeId', sql.Int, lodgeId)
            .input('itemCode', sql.NVarChar, itemCode)
            .input('itemName', sql.NVarChar, itemName)
            .input('category', sql.NVarChar, category || null)
            .input('unitOfMeasure', sql.NVarChar, unitOfMeasure || null)
            .input('reorderLevel', sql.Int, reorderLevel || 0)
            .query(`
                UPDATE InventoryItems 
                SET ItemCode = @itemCode, ItemName = @itemName, Category = @category, UnitOfMeasure = @unitOfMeasure, ReorderLevel = @reorderLevel
                WHERE InventoryItemId = @itemId AND LodgeId = @lodgeId
            `);

        res.json({ message: 'Inventory item updated successfully' });
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ message: 'Error updating inventory item' });
    }
};

module.exports = { getInventory, addTransaction, createItem, updateItem, getVendors };
