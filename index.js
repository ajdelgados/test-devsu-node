import express from 'express';
import sequelize from './shared/database/database';
import { usersRouter } from './users/router';

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 8000;

sequelize.sync({ force: true }).then(() => console.log('db is ready'));

app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/health', (req, res) => {
  res.status(200).json({ health: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function handle(signal) {
  console.info(`${signal} signal received.`);
  console.log('Closing http server.');
  await server.close();
  console.log('Http server closed.');
  await sequelize.close().then(() => console.log('db closed'));
}

process.on('SIGINT', handle);
process.on('SIGHUP', handle);
process.on('SIGTERM', handle);

export { app, server, handle };
