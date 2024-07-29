import { IncomingMessage, ServerResponse } from 'http';
import { UsersService } from './UsersService';

export class UsersController {
  static async register(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const user = await UsersService.registerUser(req.body);
    const { password, ...userWithoutPassword } = user.toDto();
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(userWithoutPassword));
  }
}
