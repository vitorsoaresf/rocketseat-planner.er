import type { FastifyInstance } from "fastify";
import { ClientError } from "./errors/client-error";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  const message = error.message;

  if (error.constructor === ZodError) {
    return reply.status(400).send({
      message: "Invalid input",
      errors: error?.flatten().fieldErrors,
    });
  }

  if (error.constructor === ClientError) {
    return reply.status(400).send({ message });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
