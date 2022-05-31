const response = (data, message="success") => {
	return { status: true,status_code :200,data: data, message: message};
};
module.exports = response;