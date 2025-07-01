const serverResponse = {
    sendSuccess: (res, message, data = null) => {
        // Fix: Handle different message parameter types
        let responseCode = 200; // Default success code
        let responseMessage = message;
        let success = true;
        
        // If message is an object (like messages.SUCCESSFUL), extract properties
        if (typeof message === 'object' && message !== null) {
            responseCode = message.code || 200;
            success = message.success !== undefined ? message.success : true;
            responseMessage = message.message || 'Success';
        } else if (typeof message === 'string') {
            // If message is a string, use it directly
            responseMessage = message;
        }

        const responseBody = {
            code: responseCode,
            success: success,
            message: responseMessage,
        };
        
        if (data) { 
            responseBody.data = data; 
        }
        
        return res.status(responseCode).json(responseBody);
    },
    sendError: (res, error) => {
        // Fix: Handle different error parameter types
        let responseCode = 500; // Default error code
        let errorMessage = 'Internal Server Error';
        
        // If error is an object, extract properties
        if (typeof error === 'object' && error !== null) {
            responseCode = error.code || 500;
            errorMessage = error.message || 'Internal Server Error';
        } else if (typeof error === 'string') {
            // If error is a string, use it directly
            errorMessage = error;
        }

        const responseMessage = {
            code: responseCode,
            success: false,
            message: errorMessage,
        };
        
        return res.status(responseCode).json(responseMessage);
    },
};

module.exports = serverResponse;