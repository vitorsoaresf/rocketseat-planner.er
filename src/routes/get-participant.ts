import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantsId",
    {
      schema: {
        params: z.object({
          participantsId: z.string().uuid(),
        }),
      },
    },

    async (request) => {
      const { participantsId } = request.params;

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantsId,
        },
      });

      if (!participant) {
        throw new ClientError("Participant not found");
      }

      return { participant };
    }
  );
}
