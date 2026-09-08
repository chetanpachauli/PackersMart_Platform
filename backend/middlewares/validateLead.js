const ApiResponse = require('../utils/apiResponse');

const validateLeadSubmission = (req, res, next) => {
  const { customer_name, mobile, email, pickup_city, destination_city, service_type, moving_date } = req.body;

  const errors = [];

  if (!customer_name || customer_name.trim().length < 2) {
    errors.push('Customer name is required and must be at least 2 characters.');
  }

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
    errors.push('Mobile number must be a valid 10-digit Indian phone number.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!pickup_city || pickup_city.trim().length === 0) {
    errors.push('Pickup city is required.');
  }

  if (!destination_city || destination_city.trim().length === 0) {
    errors.push('Destination city is required.');
  }

  const validServiceTypes = ['Home Relocation', 'Vehicle Transport', 'Office Relocation', 'Commercial Goods'];
  if (!service_type || !validServiceTypes.includes(service_type)) {
    errors.push(`Service type must be one of: ${validServiceTypes.join(', ')}.`);
  }

  if (!moving_date || isNaN(Date.parse(moving_date))) {
    errors.push('A valid moving date is required.');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation Failed', 400, errors);
  }

  next();
};

module.exports = { validateLeadSubmission };
