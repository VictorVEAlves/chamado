import "server-only";

export interface ClickUpTaskPayload {
  name: string;
  description: string;
  priority: 1 | 2 | 3 | 4;
  ticketId: string;
  ticketUrl: string;
  createdBy: string;
}

interface ClickUpListStatus {
  status: string;
  type: string;
}

interface ClickUpListResponse {
  statuses?: ClickUpListStatus[];
}

const preferredStatuses = ["to do", "todo", "backlog", "pendente"];

async function getInitialClickUpStatus(
  listId: string,
  apiToken: string,
  ticketId: string,
): Promise<string | null> {
  try {
    const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}`, {
      method: "GET",
      headers: {
        Authorization: apiToken,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[ClickUp] Falha ao consultar statuses da lista para ticket ${ticketId}: ${response.status} ${response.statusText} - ${errorBody}`,
      );
      return null;
    }

    const data = (await response.json()) as ClickUpListResponse;
    const availableStatuses =
      data.statuses?.filter(
        (status) => status.status && status.type !== "done" && status.type !== "closed",
      ) ?? [];

    if (!availableStatuses.length) {
      console.warn(
        `[ClickUp] Nenhum status inicial aberto encontrado para ticket ${ticketId}.`,
      );
      return null;
    }

    const preferredStatus = preferredStatuses.find((candidate) =>
      availableStatuses.some(
        (status) => status.status.toLowerCase() === candidate.toLowerCase(),
      ),
    );

    if (preferredStatus) {
      return (
        availableStatuses.find(
          (status) => status.status.toLowerCase() === preferredStatus.toLowerCase(),
        )?.status ?? null
      );
    }

    return availableStatuses[0]?.status ?? null;
  } catch (error) {
    console.error(
      `[ClickUp] Erro ao consultar statuses da lista para ticket ${ticketId}:`,
      error,
    );
    return null;
  }
}

export async function createClickUpTask(
  payload: ClickUpTaskPayload,
): Promise<void> {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_MARKETING_LIST_ID;

  if (!apiToken || !listId) {
    console.warn(
      `[ClickUp] Integracao ignorada para ticket ${payload.ticketId}: CLICKUP_API_TOKEN ou CLICKUP_MARKETING_LIST_ID ausente.`,
    );
    return;
  }

  try {
    const initialStatus = await getInitialClickUpStatus(listId, apiToken, payload.ticketId);

    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task`,
      {
        method: "POST",
        headers: {
          Authorization: apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: payload.name,
          description: `Chamado aberto por: ${payload.createdBy}\n\n${payload.description}\n\nLink do chamado: ${payload.ticketUrl}`,
          priority: payload.priority,
          ...(initialStatus ? { status: initialStatus } : {}),
          notify_all: false,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[ClickUp] Falha ao criar task para ticket ${payload.ticketId}: ${response.status} ${response.statusText} - ${errorBody}`,
      );
      return;
    }

    const data = (await response.json()) as { id?: string };
    console.info(
      `[ClickUp] Task criada com sucesso para ticket ${payload.ticketId}: ${data.id ?? "sem-id-retornado"}.`,
    );
  } catch (error) {
    console.error(
      `[ClickUp] Erro inesperado ao criar task para ticket ${payload.ticketId}:`,
      error,
    );
  }
}
