const { getIntegrationSdk } = require('../../api-util/sdk');

const isdk = getIntegrationSdk();

const checkUserAlreadyExist = async (req, res) => {
  const { email } = req.body;
  
  try {
    const response = await isdk.users.show({ email });
    const userExists = response.data.data && response.data.data.id ? true : false;
    
    return res.status(200).json({
      exists: userExists,
      message: userExists ? 'User already exists' : 'User does not exist'
    });
  } catch (error) {
    // If user not found, Sharetribe returns 404
    if (error.status === 404) {
      return res.status(200).json({
        exists: false,
        message: 'User does not exist'
      });
    }
    
    console.error('Error checking user:', error);
    return res.status(500).json({
      error: 'Failed to check user existence',
      message: 'Internal server error'
    });
  }
}

module.exports = checkUserAlreadyExist