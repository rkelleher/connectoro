import FuseUtils from '@fuse/FuseUtils';
import axios from 'axios';

class AccountService extends FuseUtils.EventEmitter {
  fetchAccountDetails = async () => {
    const {data} = await axios.get('/api/account');
    return data;
  }

  sendNewIntegration = async (type) => {
    const {data} = await axios.post('/api/account/integrations', {type});
    return data;
  }

  deleteIntegration = async (id) => {
    const {data} = await axios({
      method: 'delete',
      url: '/api/account/integrations',
      data: {id}
    })
    return data;
  }

  addCredential = async (id, type, content) => {
    const {data} = await axios.patch('/api/account/integrations', {
      id,
      changes: {
        credentials: {
          [type]: content
        }
      }
    });
    return data;
  }

  deleteCredential = async (id, type) => {
    const {data} = await axios.patch('/api/account/integrations', {
      id,
      changes: {
        credentials: {
          [type]: null
        }
      }
    });
    return data;
  }
}

const instance = new AccountService();

export default instance;
