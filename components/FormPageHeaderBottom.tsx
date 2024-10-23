import { FormWithRelations } from "@/types";
import FormTabs from "./FormTabs";

async function FormPageHeaderBottom({ form }: { form: FormWithRelations }) {
  const responsesCount = form.responses.length;

  return <FormTabs form={form} responses={responsesCount} />;
}

export default FormPageHeaderBottom;
