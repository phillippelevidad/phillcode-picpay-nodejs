import https, { RequestOptions } from "https";
import { IEmailService } from "./IEmailService";

export class EmailService implements IEmailService {
  async sendNotification(to: string, message: string): Promise<any> {
    const postData = JSON.stringify({ to, message });

    const options: RequestOptions = {
      hostname: "util.devi.tools",
      port: 443,
      path: "/api/v1/notify",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    try {
      const response = await this.makeHttpsRequest(options, postData);
      return response ? JSON.parse(response) : null;
    } catch (error) {
      throw new Error(
        `Failed to send notification: ${(error as Error).message}`
      );
    }
  }

  private makeHttpsRequest(
    options: RequestOptions,
    postData: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(
              new Error(`Status Code: ${res.statusCode}, Response: ${data}`)
            );
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }
}
