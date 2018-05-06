let auth = (() => {
    function isAuth() {
        return sessionStorage.getItem('authtoken') !== null
    }

    function saveSession(userData) {
        console.log('saveSession in')
        sessionStorage.setItem('authtoken', userData._kmd.authtoken)
        sessionStorage.setItem('username', userData.username)
        sessionStorage.setItem('userId', userData._id)


    }

    function register(username, password) {
        let userData = {
            username: username,
            password: password,
        }
       return kinveyRequester.post('user', '', userData, 'basic')

    }

    function login(username, password) {

        return kinveyRequester.post('user', 'login', {username, password}, 'basic')
    }

    function logout() {

        kinveyRequester.post('user', '_logout',{authtoken: localStorage.getItem('authtoken')})
            .then(() => {
                sessionStorage.clear()
            })
            .catch(notify.handleError)
    }

    return {
        isAuth, login, logout, register, saveSession
    }
})()