import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { exBufferedFile } from './file.model';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket: string;

  public get client() {
    return this.minio.client;
  }

  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger('MinioStorageService');
    this.baseBucket = this.configService.get<string>('MINIO_BUCKET');
  }

  public async uploadProfileImage(
    userId: string,
    file: exBufferedFile,
    baseBucket: string = this.baseBucket,
  ) {
    if (
      !(
        file.mimetype.includes('jpg') ||
        file.mimetype.includes('jpeg') ||
        file.mimetype.includes('png')
      )
    ) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }

    const temp_filename = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': 1234,
    };
    const filename = hashedFileName + ext;
    const fileBuffer = file.buffer;

    const userFolderPath = `profile/${userId}/`;
    const filePath = `${userFolderPath}${filename}`;

    // Start of logic to delete existing files
    const stream = this.client.listObjects(baseBucket, userFolderPath, true);
    stream.on('data', (obj) => {
      this.client.removeObject(baseBucket, obj.name, function (err) {
        if (err) {
          console.log('Error removing object:', err);
        }
      });
    });
    stream.on('error', function (err) {
      console.log('Error listing objects:', err);
    });

    this.client.putObject(
      baseBucket,
      filePath,
      fileBuffer,
      fileBuffer.length,
      metaData,
      function (err) {
        console.log(err);
        if (err)
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
      },
    );
    return {
      url: `http://localhost:${this.configService.get(
        'MINIO_PORT',
      )}/${this.configService.get('MINIO_BUCKET')}/${filePath}`,
    };
  }

  public async uploadDicomFile(
    file: exBufferedFile,
    baseBucket: string = this.baseBucket,
  ) {
    const dcmfileFormat = file.mimetype.includes('dcm');

    if (dcmfileFormat) {
      console.log(dcmfileFormat);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }

    const tempFilename = Date.now().toString();

    const hashedFileName = crypto
      .createHash('md5')
      .update(tempFilename)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': 1234,
    };
    const filename = hashedFileName + ext;
    // const fileName: string = `${filename}`;
    const fileBuffer = file.buffer;
    const userFolderPath = `dcm/`;
    const filePath = `${userFolderPath}${filename}`;

    this.client.putObject(
      baseBucket,
      filePath,
      fileBuffer,
      fileBuffer.length,
      metaData,
      function (err) {
        if (err)
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    return {
      url: `${this.configService.get(
        'MINIO_ENDPOINT',
      )}:${this.configService.get('MINIO_PORT')}/${this.configService.get(
        'MINIO_BUCKET',
      )}/${filePath}`,
    };
  }

  async delete(objectName: string, baseBucket: string = this.baseBucket) {
    try {
      await this.client.removeObject(baseBucket, objectName); // Successfully deleted the object
      // Add any additional post-deletion logic if required.
    } catch (err) {
      throw new HttpException(
        'Oops Something wrong happened',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
