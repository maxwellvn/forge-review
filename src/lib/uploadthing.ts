import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const f = createUploadthing();

export const ourFileRouter = {
  appIcon: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  appScreenshots: f({ image: { maxFileSize: '8MB', maxFileCount: 6 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Screenshot uploaded for userId:', metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  appPackage: f({
    'application/vnd.android.package-archive': { maxFileSize: '512MB', maxFileCount: 1 },
    'application/zip': { maxFileSize: '512MB', maxFileCount: 1 },
    'application/octet-stream': { maxFileSize: '512MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Package uploaded for userId:', metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;