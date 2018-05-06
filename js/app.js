$(() => {
    const app = Sammy("#container", function () {
        let footerData = {}
        let rowData = {}
        this.use("Handlebars", "hbs")
        let authtoken = ""
        let receiptId = ""

        function storeReceiptId(data) {
            console.log(ctx)
            sessionStorage.setItem("receiptId", data)
            ctx.receiptId = data
            ctx.redirect("#/home")
        }

        function renderOverviewScreen(ctx) {
            console.log('Rendering overview')
            dataHandler.getUserReceipts(sessionStorage.getItem('userId'))
                .then(res => {
                    console.log(res)
                    ctx.receiptsTotal = 0
                    for (const entry of res) {
                        ctx.receiptsTotal += Number(entry.total.toFixed(2))
                        entry.total = Number(entry.total.toFixed(2))
                        entry.creation = (entry._kmd.ect).substring(0, 16).replace('T', ' ')
                    }
                    ctx.userReceipts = res
                    ctx.currentUser = sessionStorage.getItem('username')
                    ctx.loadPartials({
                        head: "./templates/common/header-menu.hbs",
                        footer: "./templates/common/footer.hbs",
                        receiptRow: "./templates/common/receipt-row.hbs",

                    })
                        .then(function () {
                            this.partial("./templates/allreceipts.hbs")
                        })
                })
                .catch(err => {
                    notify.showError(err)
                })
        }

        function renderHomeScreen(ctx) {
            console.log("rendering Home")
            dataHandler.getActiveReceipt(sessionStorage.getItem("userId"))
                .then(ans => {
                    footerData = ans[0]
                    footerData.total = Number(footerData.total.toFixed(2))
                    console.log(footerData)
                    sessionStorage.setItem("receiptId", footerData._id)
                    ctx.currentUser = sessionStorage.getItem("username")
                    ctx.receiptId = sessionStorage.getItem("receiptId")
                    dataHandler.getEntriesById(footerData._id)
                        .then(function (res) {
                            for (const entry of res) {
                                entry.subtotal = (
                                    Number(entry.qty) * Number(entry.price)
                                ).toFixed(2)
                            }
                            ctx.receiptEntries = res
                            console.log(ctx.receiptEntries)
                            ctx.entryId = res._id
                            ctx.receiptTotal = footerData.total
                            ctx.productCount = footerData.productCount

                            ctx.loadPartials({
                                createReceipt: "./templates/forms/createReceipt.hbs",
                                head: "./templates/common/header-menu.hbs",
                                footer: "./templates/common/footer.hbs",
                                row: "./templates/common/row.hbs",
                                tableFoot: "./templates/forms/table-foot.hbs",
                                createEntryForm: "./templates/forms/create-entry-form.hbs",
                                activeRows: "./templates/forms/active-rows.hbs"
                            })
                                .then(function () {
                                    this.partial("./templates/home.hbs")
                                })
                        })
                })
                .catch(err => {
                    notify.showError(err)
                })
        }

        if (auth.isAuth()) {
            authtoken = sessionStorage.getItem("authtoken")
            this.redirect("#/home")
        }
        this.get("index.html", loadWelcomeView)

        this.get("#/index", loadWelcomeView)

        function loadWelcomeView() {
            this.loadPartials({
                footer: "./templates/common/footer.hbs"
            }).then(function () {
                this.partial("./templates/welcome.hbs")
            })

        }

        this.post("#/register", function (ctx) {
            let username = ctx.params["username-register"]
            let password = ctx.params["password-register"]
            let repeat = ctx.params["password-register-check"]

            if (username.length < 5) {
                notify.showError("Username must be at least 5 characters long")
                return
            }
            if (password.length === 0) {
                notify.showError("Password cannot be empty")
                return
            }
            if (password !== repeat) {
                notify.showError("Passwords don't match")
                return
            }
            auth.register(username, password).then(data => {
                auth.saveSession(data)
                ctx.currentUser = data.username
                notify.showInfo("User registration successful.")
                dataHandler.createNewReceipt()
                ctx.redirect("#/home")
            })
        })
        //
        this.post("#/login", function (ctx) {
            let username = ctx.params["username-login"]
            let password = ctx.params["password-login"]
            if (username == "" || password == "") {
                notify.showInfo("Username and password can not be empty!")
                return
            }

            auth.login(username, password)
                .then(function (data) {
                    auth.saveSession(data)
                    ctx.currentUser = sessionStorage.getItem("username")
                    ctx.redirect("#/home")
                    let mess = `User ${sessionStorage.getItem(
                        "username"
                    )} successfully logged in`
                    notify.showInfo(mess)
                }).catch(err => {
                notify.handleError(err)
            })
        })
        this.get("#/logout", function (ctx) {
            console.log("Logout in progerss")
            auth.logout()
            ctx.redirect("#/index")
        })

        this.get("#/home", function (ctx) {
            console.log("Getting  home")
            let context = this
            dataHandler.getActiveReceipt(sessionStorage.getItem("userId"))
                .then(function (res) {
                    console.log(res)
                    if (res.length == 0) {
                        dataHandler.createNewReceipt()
                        console.log("New receipt created")
                        renderHomeScreen(context)
                        return
                    }

                    renderHomeScreen(ctx)

                })
                .catch(err => {
                    notify.showError(err.message)
                })
        })
        this.get("#/createRow", function (ctx) {
            let prodType = ctx.params.type
            let receiptId = sessionStorage.getItem("receiptId")
            let prodQuantity = Number(ctx.params.qty)
            let prodPrice = Number(ctx.params.price)
            let rowSubtotal = prodPrice * prodQuantity
            if (isNaN(prodQuantity) || isNaN(prodPrice)) {
                notify.showError("Quantity and Price must be numbers")
                return
            }
            if (prodType == "" || prodQuantity == "" || prodPrice == "") {
                notify.showError("There must not be empty field")
                return
            }
            footerData.productCount += 1
            footerData.total += rowSubtotal
            ctx.productCount = footerData.productCount
            ctx.receiptTotal = footerData.total

            let rowData = {
                type: prodType,
                qty: prodQuantity,
                price: prodPrice,
                subtotal: rowSubtotal,
                receiptId: receiptId
            }
            ctx
                .render("./templates/common/row.hbs", rowData)
                .prependTo($("#create-entry-form").parent())
            console.log(footerData)
            console.log(ctx)
            ctx
                .render("./templates/forms/table-foot.hbs", footerData)
                .replace(".table-foot")

            console.log("beforeDataHandler")
            dataHandler.addEntry(rowData)
            notify.showInfo("Entry Added To Base")
            dataHandler.updateReceipt(footerData, sessionStorage.getItem("receiptId"))
                .then(ctx.redirect("#/home"))
                .catch(err => {
                    notify.showError(err)
                })

        })
        this.get("#/deleteRow:id", function (ctx) {
            let targetId = ctx.params.id
            let rowSubtotal = Number(
                $(`#${targetId}`)
                    .find(".subtotal")
                    .text()
            )
            console.log(rowSubtotal)

            footerData.productCount -= 1
            footerData.total -= rowSubtotal
            ctx.productCount = footerData.productCount.toFixed(2)
            ctx.receiptTotal = footerData.total.toFixed(2)
            console.log(footerData)
            ctx.render("./templates/forms/table-foot.hbs", footerData)
                .replace(".table-foot")

            dataHandler.deleteEntry(targetId)
            notify.showInfo("Entry deleted from base")

            dataHandler.updateReceipt(
                footerData,
                sessionStorage.getItem("receiptId")
            )
            ctx.redirect("#/home")
        })

        this.post("#/submitReceipt", function (ctx) {
            if (ctx.params.productCount == 0) {
                notify.showError("Receipt must have at least one row!")
                return
            }
            let context = this
            footerData.active = "false"
            console.log(footerData)
            console.log(context)
            dataHandler.updateReceipt(footerData, ctx.params.receiptId)

            ctx.redirect("#/home")
        })
        this.get("#/userReceipts", function (ctx) {
            let context = this
            renderOverviewScreen(ctx)

        })
        this.get('#/receiptDetails:receiptId', function (ctx) {
            let receiptId = ctx.params.receiptId.slice(1)
            dataHandler.getEntriesById(receiptId)
                .then(function (res) {
                    for (const entry of res) {
                        entry.subtotal = (
                            Number(entry.qty) * Number(entry.price)
                        ).toFixed(2)
                    }
                    ctx.receiptEntries = res
                    ctx.entryId = res._id
                    ctx.receiptTotal = footerData.total
                    ctx.productCount = footerData.productCount
                    ctx.currentUser = sessionStorage.getItem('username')
                    ctx.loadPartials({
                        head: "./templates/common/header-menu.hbs",
                        footer: "./templates/common/footer.hbs",
                        row: "./templates/common/detail-row.hbs",
                    })
                        .then(function () {
                            this.partial("./templates/receipt-details.hbs")
                        })
                })
                .catch(err => {
                    notify.showError(err)
                })

        })
    }).run()
})