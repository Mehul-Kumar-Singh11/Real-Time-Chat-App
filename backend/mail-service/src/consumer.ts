import amqp from 'amqplib';
import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    const channel = await connection.createChannel();

    const queueName = 'send-otp';

    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log('✅ Mail service consumer started, listening for OTP emails');

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          const transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // required for SSL port
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD,
            },
          });

          await transporter.sendMail({
            from: 'Chat App',
            to,
            subject,
            text: body,
          });

          console.log(`OTP mail sent to ${to}`);

          channel.ack(msg);
        } catch (err) {
          console.error('Failed to send OTP ', err);
        }
      }
    });
  } catch (err) {
    console.error('❌ Failed to start RabbitMq consumer', err);
  }
};
