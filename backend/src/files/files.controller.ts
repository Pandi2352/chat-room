import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { join } from 'path';
import { AuthGuard } from '@nestjs/passport';

@Controller('files')
export class FilesController {
    @Post('upload')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // Determine the base URL dynamically or from env. For now, assuming standard setup.
        // In production, you might want a full URL or just the path.
        // Let's return the relative path that the frontend can append the base URL to.
        return {
            filename: file.filename,
            path: `/files/${file.filename}`,
            mimetype: file.mimetype
        };
    }

    @Get(':filename')
    serveFile(@Param('filename') filename: string, @Res() res: Response) {
        return res.sendFile(filename, { root: join(process.cwd(), 'uploads') });
    }
}
