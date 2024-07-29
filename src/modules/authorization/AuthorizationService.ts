import https from "https";
import { Logger } from "utils/Logger";

interface AuthorizationResponse {
  status: string;
  data: {
    authorization: boolean;
  };
}

export class AuthorizationService {
  static authorize(
    _payerId: number,
    _payeeId: number,
    _amount: number
  ): Promise<boolean> {
    const url = "https://util.devi.tools/api/v2/authorize";

    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk: string) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const response: AuthorizationResponse = JSON.parse(data);
              resolve(
                response.status === "success" && response.data.authorization
              );
            } catch (error) {
              reject(new Error("Failed to parse JSON response"));
            }
          });
        })
        .on("error", (error: Error) => {
          reject(error);
        });
    });
  }
}
