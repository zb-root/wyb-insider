let BaseErrCode = 3100

module.exports = {
  Err: {
    // SUCCESS: {
    //   err: 0,
    //   msg: 'Success'
    // },
    //
    // FAIL: {
    //   err: 1,
    //   msg: 'Fail'
    // },
    //
    // FA_SYS: {
    //   err: 2,
    //   msg: 'System Error'
    // },
    //
    // FA_NETWORK: {
    //   err: 3,
    //   msg: 'Network Error'
    // },
    //
    // FA_PARAMS: {
    //   err: 4,
    //   msg: 'Parameter Error'
    // },
    //
    // FA_BUSY: {
    //   err: 5,
    //   msg: 'Busy'
    // },
    //
    // FA_TIMEOUT: {
    //   err: 6,
    //   msg: 'Time Out'
    // },
    //
    // FA_ABORT: {
    //   err: 7,
    //   msg: 'Abort'
    // },
    //
    // FA_NOTREADY: {
    //   err: 8,
    //   msg: 'Not Ready'
    // },
    //
    // FA_NOTEXISTS: {
    //   err: 9,
    //   msg: 'Not Exists'
    // },
    //
    // FA_EXISTS: {
    //   err: 8,
    //   msg: 'Already Exists'
    // },
    //
    // OK: {
    //   err: 200,
    //   msg: 'OK'
    // },
    //
    // FA_BADREQUEST: {
    //   err: 400,
    //   msg: 'Bad Request'
    // },
    //
    // FA_NOAUTH: {
    //   err: 401,
    //   msg: 'Unauthorized'
    // },
    //
    // FA_NOPERMISSION: {
    //   err: 403,
    //   msg: 'Forbidden'
    // },
    //
    // FA_NOTFOUND: {
    //   err: 404,
    //   msg: 'Not Found'
    // },
    //
    // FA_INTERNALERROR: {
    //   err: 500,
    //   msg: 'Internal Server Error'
    // },
    //
    // FA_UNAVAILABLE: {
    //   err: 503,
    //   msg: 'Service Unavailable'
    // }
    FA_CREATE_FAIL: {
      err: BaseErrCode + 1,
      msg: 'Create Fail'
    },
    FA_PARAMS_FAIL: {
      err: BaseErrCode + 2,
      msg: 'Parameter Error ${params}'
    },
    FA_REQUIRE: {
      err: BaseErrCode + 3,
      msg: 'Lack of required items ${params}'
    }
  }
}
