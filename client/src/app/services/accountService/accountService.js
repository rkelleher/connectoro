import FuseUtils from '@fuse/FuseUtils';
import axios from 'axios';

class AccountService extends FuseUtils.EventEmitter {
  fetchAccountDetails = async () => {
    const {data} = await axios.get('/api/account');
    return data;
  }

  sendNewIntegration = async (type) => {
    const {data} = await axios.post('/api/account/integrations', {type})
    return data;
  }
}

const instance = new AccountService();

export default instance;
