import { Request, Response } from 'express';

interface CreatePost {
  id: number;
  title: string;
  content: string;
}

export class AuthController {
  id: number = 1;
  posts: CreatePost[] = [];
  register(req: Request, res: Response) {
    res.status(200).json();
  }
}
