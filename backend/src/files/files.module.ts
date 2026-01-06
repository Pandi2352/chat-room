import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/i) && !file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/i)) {
                    // Fallback loose check
                    return cb(new Error('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
        }),
    ],
    controllers: [FilesController],
    providers: [FilesService],
})
export class FilesModule { }
