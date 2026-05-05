import { readItem, deleteItem, createItem } from "@/app/clientService";
import { itemSchema } from "@/lib/definitions";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError, getErrorMessage } from "@/lib/utils";

export type CreateItemState = {
  message?: string;
  redirectTo?: string;
  errors?: {
    name?: string[];
    description?: string[];
    quantity?: string[];
  };
};

export async function fetchItems(page: number = 1, size: number = 10) {
  const token = getAuthToken();

  if (!token) {
    return { message: "No access token found" };
  }

  const response = await readItem({
    query: {
      page: page,
      size: size,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const error = getApiError(response);

  if (error) {
    return { message: getErrorMessage({ detail: error }) };
  }

  return getApiData(response);
}

export async function removeItem(id: string) {
  const token = getAuthToken();

  if (!token) {
    return { message: "No access token found" };
  }

  const response = await deleteItem({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    path: {
      item_id: id,
    },
  });

  const error = getApiError(response);

  if (error) {
    return { message: getErrorMessage({ detail: error }) };
  }

  return { success: true };
}

export async function addItem(prevState: {}, formData: FormData) {
  const token = getAuthToken();

  if (!token) {
    return { message: "No access token found", redirectTo: "/login" };
  }

  const validatedFields = itemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, description, quantity } = validatedFields.data;

  const input = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name,
      description,
      quantity,
    },
  };
  const response = await createItem(input);
  const error = getApiError(response);

  if (error) {
    return { message: getErrorMessage({ detail: error }) };
  }

  return { redirectTo: "/dashboard" };
}
