import { hashPassword } from './auth';
import { createUser } from './store';

export async function seedDefaultUser() {
  const email = 'demo@miniq.io';
  const passwordHash = await hashPassword('12345678');

  createUser({
    email,
    passwordHash,
    companyName: 'MiniQ Tecnologia LTDA',
    cnpj: '41.687.058/0001-21',
    companyType: 'LTDA',
    partners: [
      {
        id: 'demo-partner-1',
        name: 'Ana Souza',
        cpf: '123.456.789-00',
        share: 60,
        isAdmin: true,
      },
      {
        id: 'demo-partner-2',
        name: 'Bruno Lima',
        cpf: '987.654.321-00',
        share: 30,
        isAdmin: false,
      },
      {
        id: 'demo-partner-3',
        name: 'Carla Mendes',
        cpf: '456.789.123-00',
        share: 10,
        isAdmin: false,
      },
    ],
  });
}
