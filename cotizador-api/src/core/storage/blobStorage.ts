import {
  BlobServiceClient,
  ContainerClient,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import sharp from "sharp";
import { AppError } from "../errors/appError";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || "uploads";
const accountName =
  process.env.AZURE_ACCOUNT_NAME || getValueFromConnectionString("AccountName");
const accountKey =
  process.env.AZURE_ACCOUNT_KEY || getValueFromConnectionString("AccountKey");

function getValueFromConnectionString(key: string) {
  if (!connectionString) return undefined;
  const regex = new RegExp(`${key}=([^;]+)`, "i");
  const match = connectionString.match(regex);
  return match?.[1];
}

const getContainerClient = async (): Promise<ContainerClient> => {
  if (!connectionString) {
    throw new AppError(
      "Falta la configuracion de Azure Blob Storage",
      500
    );
  }

  const service = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = service.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  return containerClient;
};

interface UploadImageOptions {
  folder: string;
  identifier?: string;
  width?: number;
  height?: number;
  quality?: number;
}

export const uploadImageToBlob = async (
  buffer: Buffer,
  {
    folder,
    identifier,
    width = 512,
    height = 512,
    quality = 80,
  }: UploadImageOptions
): Promise<string> => {
  const containerClient = await getContainerClient();
  const timestamp = Date.now();
  const isDev = process.env.NODE_ENV !== "production";
  const baseName = isDev
    ? identifier
      ? `test-${identifier}`
      : "test"
    : identifier ?? Math.round(Math.random() * 1e9).toString();
  const blobPath = `${folder}/${baseName}-${timestamp}.webp`;

  const processedBuffer = await sharp(buffer)
    .resize(width, height, { fit: "inside" })
    .webp({ quality })
    .toBuffer();

  const blobClient = containerClient.getBlockBlobClient(blobPath);
  await blobClient.uploadData(processedBuffer, {
    blobHTTPHeaders: { blobContentType: "image/webp" },
  });

  // Guardamos solo la ruta relativa para combinar con la base publica en el front
  return `/${blobPath}`;
};

export const getSignedBlobUrl = (
  blobPath: string,
  expiresInMinutes = 60
): string => {
  if (!accountName || !accountKey) {
    throw new AppError(
      "Falta configuracion de credenciales de Azure para firmar URLs",
      500
    );
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const cleanPath = blobPath
    .replace(/^\//, "")
    .replace(/^uploads\//i, "");
  const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: cleanPath,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
      protocol: SASProtocol.Https,
    },
    credential
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${cleanPath}?${sas}`;
};
