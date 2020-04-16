import request from 'supertest';
import { isUuid } from 'uuidv4';
import app from '../app';

describe('Transaction', () => {
  it('should be able to create a new transaction', async () => {
    const response = await request(app).post('/transactions').send({
      title: 'Loan',
      value: 1200,
      type: 'income',
    });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      title: 'Loan',
      value: 1200,
      type: 'income',
    });
  });

  it('should be able to list the transactions', async () => {
    await request(app).post('/transactions').send({
      title: 'Salary',
      value: 3000,
      type: 'income',
    });

    await request(app).post('/transactions').send({
      title: 'Bicycle',
      value: 1500,
      type: 'outcome',
    });

    const response = await request(app).get('/transactions');

    expect(response.body.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: 'Salary',
          value: 3000,
          type: 'income',
        }),
        expect.objectContaining({
          id: expect.any(String),
          title: 'Bicycle',
          value: 1500,
          type: 'outcome',
        }),
        expect.objectContaining({
          id: expect.any(String),
          title: 'Loan',
          value: 1200,
          type: 'income',
        }),
      ]),
    );

    expect(response.body.balance).toMatchObject({
      income: 4200,
      outcome: 1500,
      total: 2700,
    });
  });

  it('should not be able to create outcome transaction without a valid balance', async () => {
    const response = await request(app).post('/transactions').send({
      title: 'Bicycle',
      value: 3000,
      type: 'outcome',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject(
      expect.objectContaining({
        error: expect.any(String),
      }),
    );
  });
});
