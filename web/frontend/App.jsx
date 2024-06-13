import { useTranslation } from "react-i18next";
import Routes from "./Routes";

import {
  NavigationMenu,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <>
      <NavigationMenu />
      <Routes pages={pages} />
    </>
  );
}
