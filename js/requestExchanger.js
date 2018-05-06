const dataHandler = (() => {
    function getActiveReceipt(userId) {
        //    GET https://baas.kinvey.com/appdata/app_key/receipts?query={"_acl.creator":"userId","active":"true"}
        return kinveyRequester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"true"}`)
    }

    function getEntriesById(receiptId) {
        // GET https://baas.kinvey.com/appdata/app_key/entries?query={"receiptId":"receiptId"}
        return kinveyRequester.get('appdata', `entries?query={"receiptId":"${receiptId}"}`)
    }

    function createNewReceipt() {
        let data = {
            "active": "true",
            "productCount": 0,
            "total": 0
        }

        //    POST https://baas.kinvey.com/appdata/app_key/receipts
        kinveyRequester.post('appdata', 'receipts', data)
    }

    function addEntry(data) {
        //    POST https://baas.kinvey.com/appdata/app_key/entries
        kinveyRequester.post('appdata', 'entries', data)
    }

    function deleteEntry(entry_id) {
        //    DELETE https://baas.kinvey.com/appdata/app_key/entries/entry_id
        kinveyRequester.remove('appdata', `entries/${entry_id}`, )
    }

    function getUserReceipts(userId) {
        // GET https://baas.kinvey.com/appdata/app_key/receipts?query={"_acl.creator":"userId","active":"false"}
        return kinveyRequester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"}`)
    }

    function getReceiptDetails(receipt_id) {
        //    GET https://baas.kinvey.com/appdata/app_key/receipts/receipt_id
        return kinveyRequester.get('appdata', `receipts/${receipt_id}`)
    }

    function updateReceipt(data, receipt_id) {
        //PUT  https://baas.kinvey.com/appdata/app_key/receipts/receipt_id
        kinveyRequester.update('appdata', `receipts/${receipt_id}`, data)
    }

    function testDataHandler() {
        console.log("DataHandler")
    }

    return {
        getActiveReceipt,
        getEntriesById,
        createNewReceipt,
        addEntry,
        deleteEntry,
        getUserReceipts,
        getReceiptDetails,
        updateReceipt,
        testDataHandler
    }
})()