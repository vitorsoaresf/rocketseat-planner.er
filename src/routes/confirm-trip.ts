import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },

    async (request, reply) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      if (trip.is_confirmed) {
        return reply.redirect(`http://localhost:3000/trips/${tripId}`);
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.starts_at).format("LL");

      const mail = await getMailClient();

      await Promise.all([
        trip.participants.map(async (participant) => {
          const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`;

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
        }),
      ]);

      return reply.redirect(`http://localhost:3000/trips/${tripId}`);
    }
  );
}
