import { DataSource } from 'typeorm';

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

export const isValidJWT = (aInCookie: string | null): boolean => {
  if (aInCookie == null) {
    return false;
  }

  const parts = aInCookie.split('.');
  if (parts.length != 3) {
    return false;
  }

  try {
    parts.forEach((part) => {
      Buffer.from(part, 'base64').toString('utf-8');
      return true;
    });
  } catch (error) {
    return false;
  }

  return true;
};
