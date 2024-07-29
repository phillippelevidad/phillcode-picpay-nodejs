```
phillcode-picpay-nodejs
├─ .eslintrc.json
├─ src
│  ├─ app.ts
│  ├─ framework
│  │  ├─ errors
│  │  │  ├─ BadRequestError.ts
│  │  │  ├─ HttpError.ts
│  │  │  └─ NotFoundError.ts
│  │  ├─ middlewares
│  │  │  ├─ errorHandler.ts
│  │  │  └─ json.ts
│  │  ├─ MyExpress.ts
│  │  ├─ Router.test.ts
│  │  └─ Router.ts
│  ├─ modules
│  │  ├─ authorization
│  │  │  └─ AuthorizationService.ts
│  │  ├─ notifications
│  │  │  ├─ Notification.ts
│  │  │  ├─ NotificationsModule.ts
│  │  │  ├─ NotificationsRepository.ts
│  │  │  └─ NotificationsService.ts
│  │  ├─ transfers
│  │  │  ├─ Transfer.ts
│  │  │  ├─ transfers.http
│  │  │  ├─ TransfersController.ts
│  │  │  ├─ TransfersModule.ts
│  │  │  ├─ TransfersRepository.ts
│  │  │  └─ TransfersService.ts
│  │  ├─ users
│  │  │  ├─ User.ts
│  │  │  ├─ users.http
│  │  │  ├─ UsersController.ts
│  │  │  ├─ UsersModule.ts
│  │  │  ├─ UsersRepository.ts
│  │  │  └─ UsersService.ts
│  │  └─ wallets
│  │     ├─ Wallet.ts
│  │     ├─ WalletsModule.ts
│  │     ├─ WalletsRepository.ts
│  │     └─ WalletsService.ts
│  └─ utils
│     ├─ Database.test.ts
│     ├─ Database.ts
│     ├─ EmailService.test.ts
│     ├─ EmailService.ts
│     ├─ Entity.ts
│     ├─ Logger.test.ts
│     ├─ Logger.ts
│     ├─ parseFilter.test.ts
│     ├─ parseFilter.ts
│     ├─ SimpleMutex.test.ts
│     ├─ SimpleMutex.ts
│     └─ SomePartial.ts
├─ tsconfig.build.json
└─ tsconfig.json
```
