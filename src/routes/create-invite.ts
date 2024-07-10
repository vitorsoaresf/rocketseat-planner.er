import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },

    async (request) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: trip.id,
        },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.starts_at).format("LL");

      const mail = await getMailClient();

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

      const message = await mail.sendMail({
        from: {
          name: "Equipre plann.er",
          address: "teste@mail.com",
        },
        to: participant.email,
        subject: `Confirme sua viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `
                    <div>
                      Teste de confirmação de viagem com destino para ${trip.destination} nas datas de ${formattedStartDate} e ${formattedEndDate}
                      Clique no link para confirmar <a href="${confirmationLink}">Confirmar viagem</a>
                    </div>
                `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { participant: participant.id };
    }
  );
}
