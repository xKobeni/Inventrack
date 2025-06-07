import axios from 'axios';

const getIPInfo = async (ip) => {
  const token = process.env.IPINFO_TOKEN;
  try {
    const res = await axios.get(`https://ipinfo.io/${ip}/json?token=${token}`);
    return {
      ip: res.data.ip,
      location: `${res.data.city}, ${res.data.country}`,
      browser: req.headers['user-agent'],
      os: req.headers['user-agent'],
      device: req.headers['user-agent'],
    };
  } catch (err) {
    console.warn('ipinfo.io failed:', err.message);
    return null;
  }
};

const getIPApiFallback = async (ip) => {
  try {
    const res = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      ip: res.data.ip,
      location: `${res.data.city}, ${res.data.country_name}`,
      browser: req.headers['user-agent'],
      os: req.headers['user-agent'],
      device: req.headers['user-agent'],
    };
  } catch (err) {
    console.warn('ipapi.co fallback failed:', err.message);
    return null;
  }
};

const getGeoInfo = async (req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  // Prefer ipinfo.io
  let result = await getIPInfo(ip);

  // Fallback to ipapi.co if enabled
  if (!result && process.env.USE_IPAPI_FALLBACK === 'true') {
    result = await getIPApiFallback(ip);
  }

  return result || { ip, location: 'Unknown' };
};

module.exports = getGeoInfo;
