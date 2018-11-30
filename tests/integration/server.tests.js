import app from '../../../server';
import { request } from 'supertest';

describe('Basic test of the application', async () => {

  it('should display the home message', async () => {
    const resp = await request(app).get('/');
    expect(resp.text).toBe('Hell_ I\'m K_ttel_ ! #MissingType');
  });
})