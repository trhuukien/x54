import prisma from './context/prisma.js';
export const updateConfig = async (sessId, path, value) => {
  await prisma.config.upsert({
    where: {
      session_id_path: {
        path,
        session_id: sessId
      }
    },
    create: {
      path,
      value,
      session: {
        connect: {
          id: sessId
        }
      }
    },
    update: {
      path,
      value
    }
  });
};

export const getConfig = async (sessId, path) => {
  return prisma.config.findUnique({
    where: {
      session_id_path: {session_id: sessId, path}
    }
  });
};