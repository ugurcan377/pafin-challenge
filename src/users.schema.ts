const paramsJsonSchema: Object = {
    type: 'object',
    required: [ 'id' ],
    properties: {
      id: { 
        type: 'string',
        format: 'uuid',
        errorMessage: {
          format: 'should be a valid UUID',
        } },
    }
  }
  
  const bodyJsonSchema: Object = {
    type: 'object',
    required: [ 'name', 'email', 'password' ],
    properties: {
      name: { type: 'string' },
      email: { 
        type: 'string',
        format: 'email',
        errorMessage: {
          format: 'should be a valid email address',
        } },
      password: {
        type: 'string',
        minLength: 8,
        errorMessage: {
          minLength: 'should be a at least 8 characters long',
        } 
      }
    },
    additionalProperties: false
  }
  
  const putBodyJsonSchema: Object = {
    ...bodyJsonSchema,
    required: []
  }

  export {
    paramsJsonSchema,
    bodyJsonSchema,
    putBodyJsonSchema,
  }