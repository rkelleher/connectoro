import { User } from '../models/user.model.js';
import { Account } from '../models/account.model.js';

export async function getUser(userId) {
  const user = await User.findById(userId);
  return user;
}

export async function getUserByEmail(email) {
  const user = await User.findOne({email});
  return user;
}

export function getUsers(usersArray) {
  return User.find({_id: { $in: usersArray }});
}

export async function createAdminUser({
  displayName,
  email,
  passwordHash
}) {
  const user = new User({
    displayName,
    email,
    passwordHash,
    role: 'admin'
  })
  await user.save();
  return user;
}

export async function removeUser(userId) {
  return User.deleteOne({_id: userId});
}

export function buildUserDetails(user) {
  return {
    id: user.id,
    role: user.role,
    accountId: user.account,
    data: {
      'displayName': user.displayName,
      'photoURL'   : 'assets/images/avatars/Abbott.jpg',
      'email'      : user.email,
      settings     : {
        layout          : {
          style : 'layout1',
          config: {
            scroll : 'content',
            navbar : {
              display : true,
              folded  : false,
              position: 'left'
            },
            toolbar: {
              display : true,
              style   : 'fixed',
              position: 'below'
            },
            footer : {
              display : false,
              style   : 'fixed',
              position: 'below'
            },
            mode   : 'fullwidth'
          }
        },
        customScrollbars: true,
        theme           : {
          main   : 'default',
          navbar : 'defaultDark',
          toolbar: 'defaultDark',
          footer : 'defaultDark'
        }
      }
    }
  }
}

export async function getUserDetailsById(userId) {
  // TODO use select() to fetch less data
  const user = await User.findById(userId);
  return buildUserDetails(user);
}

export async function getUserAccount(userId) {
  return Account.findOne({ 
    users: { 
      $elemMatch : { 
        $eq: userId 
      } 
    } 
  });
}
