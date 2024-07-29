import { errorHandler } from "framework/middlewares/errorHandler";
import { json } from "framework/middlewares/json";
import { MyExpress } from "framework/MyExpress";
import { NotificationsModule } from "modules/notifications/NotificationsModule";
import { TransfersModule } from "modules/transfers/TransfersModule";
import { UsersModule } from "modules/users/UsersModule";
import { WalletsModule } from "modules/wallets/WalletsModule";
import { Logger } from "utils/Logger";

const app = new MyExpress();
app.use(json);

NotificationsModule.register(app);
TransfersModule.register(app);
UsersModule.register(app);
WalletsModule.register(app);

app.use(errorHandler);
app.listen(3000, () => {
  new Logger("App").debug("Server is running on port 3000");
});
