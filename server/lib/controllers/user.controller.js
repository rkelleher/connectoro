import { User } from '../models/user.model.js';

export function getUserDetails(user) {
  return {
    role: "admin",
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
              folded  : true,
              position: 'left'
            },
            toolbar: {
              display : true,
              style   : 'fixed',
              position: 'below'
            },
            footer : {
              display : true,
              style   : 'fixed',
              position: 'below'
            },
            mode   : 'fullwidth'
          }
        },
        customScrollbars: true,
        theme           : {
          main   : 'defaultDark',
          navbar : 'defaultDark',
          toolbar: 'defaultDark',
          footer : 'defaultDark'
        }
      },
      shortcuts    : [
        'calendar',
        'mail',
        'contacts'
      ]
    }
  }
}

export async function getUserDetailsById(id) {
  // TODO use select() to fetch less data
  const user = await User.findById(id);
  return getUserDetails(user);
}