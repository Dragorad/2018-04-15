let kinveyRequester = (() => {
    const chirpBaseUrl = "https://baas.kinvey.com/"
    const appId = "kid_rkCYgi13G"
    const appSecret = "7653735a00834b9ebf29eed1b5bea8d5"

    function makeAuth(type) {
        if (type === "basic") {
            return "Basic " + btoa(appId + ":" + appSecret)
        } else {
            return "Kinvey " + sessionStorage.getItem("authtoken")
        }
    }

    function makeRequest(method, module, endpoint, auth) {
        return (req = {
            method,
            url: chirpBaseUrl + module + "/" + appId + "/" + endpoint,
            headers: {
                Authorization: makeAuth(auth)
            }
        })
    }

    function get(module, endpoint, auth) {
        return $.ajax(makeRequest("GET", module, endpoint, auth))
    }

    function post(module, endpoint, data, auth) {
        let req = makeRequest("POST", module, endpoint, auth)
        req.data = JSON.stringify(data)
        req.headers["Content-Type"] = "application/json"
        return $.ajax(req)
    }
    function update(module, endpoint, data, auth) {
        let req = makeRequest('PUT', module, endpoint, auth);
        req.data = JSON.stringify(data);
        req.headers['Content-Type'] = 'application/json';
        return $.ajax(req);
    }

    function remove(module, endpoint, auth) {
        return $.ajax(makeRequest('DELETE', module, endpoint, auth));
    }

    return {
        get, post, update, remove
    }
})()



function handleSalerError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}
