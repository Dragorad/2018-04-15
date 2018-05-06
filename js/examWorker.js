let action = (() => {
    let productCount = 0

    function getUserReceipts() {
        let userId = sessionStorage.getItem('userId')
        return $.ajax(kinveyRequester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"`))
    }

    function createProductRow(prodName, prodQuantity, productPrice) {
        productCount += 1
        console.log(productCount)
        let rowSubtotal = Number(prodQuantity * productPrice)
        let totalDiv = $('.receipt-total')
        let receiptTotal = Number(totalDiv.text())
        receiptTotal += rowSubtotal
        totalDiv.text(receiptTotal.toFixed(2))

        let productCountRow = $('#create-receipt-form').find('input[name = "productCount"]')
        let receiptTotalRow = $('#create-receipt-form').find('input[name = "total"]')
        let element = $(`<div class="row">
                <div class="col wide product-name" >${prodName}</div>
                <div class="col wide product-quantity">${Number(prodQuantity)}</div>
                <div class="col wide product-price">${Number(productPrice)}</div>
                <div class="col subtotal">${rowSubtotal}</div>
                <div class="col subtotal">${rowSubtotal}</div>


            </div>`)

        let xHref = $('<div class="col right">' +
            '<a href="#/deleteRow">&#10006;</a></div>').click(function () {
            productCount -= 1
            receiptTotal -= rowSubtotal
            console.log(productCount + "/" + receiptTotal)
            $('.receipt-total').text(receiptTotal.toFixed(2))
            notify.showInfo("Entry removed")
            updateFooter()
            $(this).parent().remove()

        })
        element.append(xHref)

        // $('#active-entries').prepend(element)
        console.log(productCount + "/" + receiptTotal)
        productCountRow.val(productCount)
        updateFooter()

        function updateFooter() {
            productCountRow.val(productCount)
            receiptTotalRow.val(receiptTotal)
        }
    }

    return {
        getUserReceipts, createProductRow

    }
})()