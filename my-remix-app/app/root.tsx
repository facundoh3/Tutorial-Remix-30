import { json,redirect,LoaderFunctionArgs } from "@remix-run/node";
import{ useEffect } from "react";
import { Form,Links,Link,Meta,Scripts,Outlet,ScrollRestoration,useLoaderData,NavLink,useNavigation,useSubmit} from "@remix-run/react";

import { getContacts, createEmptyContact } from "../app/data";

//Esto sirve para cargar la data que llega
export const loader = async ({request}:LoaderFunctionArgs)=>
{
  const url=new URL(request.url);
  const q=url.searchParams.get("q");
  const contacts=await getContacts(q);
  return json({ contacts , q});
};

//Importar css personalizado
import type { LinksFunction } from "@remix-run/node";
import styleSheet from "../app/app.css";
export const links: LinksFunction=()=>[
  {rel:"styleSheet",href:styleSheet}
]

//Crear contactos
export const action=async()=>
{
  const contact=await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function App() {
  const { contacts,q } = useLoaderData<typeof loader>();
  const navigation=useNavigation();
  const submit = useSubmit();

  const searching=navigation.location && new URLSearchParams(navigation.location.search).has("q");

  useEffect(()=>
    {
      const searchField=document.getElementById("q");
      if (searchField instanceof HTMLInputElement)
      {
        searchField.value=q || "";
      }
    },[q])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search"
              onChange={(event)=>
                {
                  const isFirstSearch=q===null;
                  submit(event.currentTarget,{replace:!isFirstSearch});
                }}
            >
              <input
                aria-label="Search contacts"
                className={ searching ? "loading" : ""}
                id="q"
                name="q"
                placeholder="Search"
                type="search"
                defaultValue={ q||"" }
              />
              <div
                aria-hidden
                hidden={!searching}
                id="search-spinner"
              />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>

          <nav>
          {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive,isPending })=>isActive?"active":isPending?"pending":""}
                      to={`contacts/${contact.id}`}
                     >
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? (
                          <span>★</span>
                        ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
            <ul>
              <li>
                <Link to={`/contacts/1`}>Facundo</Link>
                {/* <a href={`/contacts/1`}>Your Name</a>  esta shit se usaba antes*/}
              </li>
              <li>
                <Link to={`/contacts/2`}>Roberta</Link>
                {/* <a href={`/contacts/2`}>Your Friend</a> */}
              </li>
            </ul>
          </nav>
        </div>
        <div id="detail"
            className={
              navigation.state === "loading" && !searching ? "loading" : ""
            }
        >
          <Outlet/>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
