var helpers = require('../helpers');
var AWS = helpers.AWS;

describe('AWS.S3Control', function() {
  it('append accountId to hostname when supplied', function() {
    var client = new AWS.S3Control({region: 'us-east-1'});
    var request = client.getPublicLockdown({AccountId: '111'});
    helpers.mockResponse({data: {}});
    request.send();
    expect(request.httpRequest.headers['x-amz=account-id']).to.eql(undefined);
    expect(request.httpRequest.headers.Host).to.eql('111.s3-control.us-east-1.amazonaws.com');
    expect(request.httpRequest.endpoint.hostname).to.eql('111.s3-control.us-east-1.amazonaws.com');
  });

  it('shouldn\'t append accountId if not supplied', function() {
    var client = new AWS.S3Control({region: 'us-east-1'});
    var request = client.putPublicLockdown({});
    helpers.mockResponse({data: {}});
    request.send();
    expect(request.httpRequest.headers.Host).to.eql('s3-control.us-east-1.amazonaws.com');
    expect(request.httpRequest.endpoint.hostname).to.eql('s3-control.us-east-1.amazonaws.com'); 
  });

  it('should add hostId and requestId to exception response', function() {
    var client = new AWS.S3Control({region: 'us-east-1'});
    var request = client.deletePublicLockdown({AccountId: '111'});
    helpers.mockHttpResponse(404, {
      'x-amz-request-id': 'requestId',
      'x-amz-id-2': 'hostId',
    }, '<?xml version="1.0" encoding="UTF-8"?><ErrorResponse><Error><Code>NoSuchAccount</Code><Message>The account was not found</Message><AccountId>111</AccountId></Error><RequestId>requestId</RequestId><HostId>hostId</HostId></ErrorResponse>')
    request.send(function(err, data) {
      expect(data).to.eql(null);
      expect(err.hostId).to.eql('hostId');
      expect(err.requestId).to.eql('requestId');
    });
  })
})