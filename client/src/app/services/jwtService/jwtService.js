import axios from 'axios';
import jwtDecode from 'jwt-decode';
import FuseUtils from '@fuse/FuseUtils';

class jwtService extends FuseUtils.EventEmitter {

    init()
    {
        this.setInterceptors();
        this.handleAuthentication();
    }

    setInterceptors = () => {
        axios.interceptors.response.use(response => {
            return response;
        }, err => {
            return new Promise((resolve, reject) => {
                // TODO handle unauthorized response
                // if ( err.response.status === 401 && err.config && !err.config.__isRetryRequest )
                // {
                //     // if you ever get an unauthorized response, logout the user
                //     this.emit('onAutoLogout', 'Invalid access_token');
                //     this.setSession(null);
                // }
                throw err;
            });
        });
    };

    handleAuthentication = () => {

        let access_token = this.getAccessToken();

        if ( !access_token )
        {
            this.emit('onNoAccessToken');

            return;
        }

        if ( this.isAuthTokenValid(access_token) )
        {
            this.setSession(access_token);
            this.emit('onAutoLogin', true);
        }
        else
        {
            this.setSession(null);
            this.emit('onAutoLogout', 'access_token expired');
        }
    };

    createUser = async (reqData) => {
        try {
            const {data} = await axios.post('/api/auth/register', reqData);
            if (data.user) {
                this.setSession(data.token);
                return {
                    user: data.user
                }
            } else {
                throw new Error('No user in serer response');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                // the server has given us a reason
                return {
                    problem: error.response.data.message
                }
            } else {
                // the server is not responding or there was a 500 error etc.
                throw new Error(error);
            }
            
        }
    };

    signInWithEmailAndPassword = async (email, password) => {
        try {
            const {data} = await axios.post('/api/auth', {
                email,
                password
            });
            if (data.user) {
                this.setSession(data.token);
                return {
                    user: data.user
                }
            } else {
                throw new Error('No user in server response');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                // the server has given us a reason, likely incorrect login data
                return {
                    problem: error.response.data.message
                }
            } else {
                // the server is not responding or there was a 500 error etc.
                throw new Error(error);
            }
        }
    };

    signInWithToken = () => {
        return new Promise((resolve, reject) => {
            axios.get('/api/auth/access-token')
                .then(response => {
                    if ( response.data.user )
                    {
                        this.setSession(response.data.token);
                        resolve(response.data.user);
                    }
                    else
                    {
                        this.logout();
                        reject('Failed to login with token.');
                    }
                })
                .catch(error => {
                    this.logout();
                    reject('Failed to login with token.');
                });
        });
    };

    updateUserData = (user) => {
        return axios.post('/api/auth/user/update', {
            user: user
        });
    };

    setSession = access_token => {
        // TODO move tokens out of localstorage and into cookies
        if ( access_token )
        {
            localStorage.setItem('jwt_access_token', access_token);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        }
        else
        {
            localStorage.removeItem('jwt_access_token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    logout = () => {
        this.setSession(null);
    };

    isAuthTokenValid = access_token => {
        if ( !access_token )
        {
            return false;
        }
        const decoded = jwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if ( decoded.exp < currentTime )
        {
            console.warn('access token expired');
            return false;
        }
        else
        {
            return true;
        }
    };

    getAccessToken = () => {
        return window.localStorage.getItem('jwt_access_token');
    };
}

const instance = new jwtService();

export default instance;
