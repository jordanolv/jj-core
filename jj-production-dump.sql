--
-- PostgreSQL database dump
--

\restrict gpckEUEZ5kbFIPzmquH8321ngsXRB1zKONdo8LhBRzNz8E3Q107xIHaeSeFAgL6

-- Dumped from database version 15.14 (Debian 15.14-0+deb12u1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Abonnement; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."Abonnement" (
    id text NOT NULL,
    nom text NOT NULL,
    prix double precision NOT NULL,
    frequence text NOT NULL,
    "dateDebut" timestamp(3) without time zone NOT NULL,
    "dateFin" timestamp(3) without time zone,
    actif boolean DEFAULT true NOT NULL,
    categorie text,
    description text,
    "profileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Abonnement" OWNER TO jjcore_user;

--
-- Name: BudgetCategory; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."BudgetCategory" (
    id text NOT NULL,
    name text NOT NULL,
    color text,
    icon text,
    "monthId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BudgetCategory" OWNER TO jjcore_user;

--
-- Name: BudgetExpense; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."BudgetExpense" (
    id text NOT NULL,
    description text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL,
    "monthId" text NOT NULL,
    "profileId" text NOT NULL,
    "isShared" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BudgetExpense" OWNER TO jjcore_user;

--
-- Name: BudgetIncome; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."BudgetIncome" (
    id text NOT NULL,
    description text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "monthId" text NOT NULL,
    "profileId" text NOT NULL,
    "isShared" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BudgetIncome" OWNER TO jjcore_user;

--
-- Name: BudgetMonth; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."BudgetMonth" (
    id text NOT NULL,
    month integer NOT NULL,
    "yearId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BudgetMonth" OWNER TO jjcore_user;

--
-- Name: BudgetYear; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."BudgetYear" (
    id text NOT NULL,
    year integer NOT NULL,
    "profileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BudgetYear" OWNER TO jjcore_user;

--
-- Name: DefaultBudgetCategory; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."DefaultBudgetCategory" (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#10b981'::text NOT NULL,
    icon text,
    "profileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DefaultBudgetCategory" OWNER TO jjcore_user;

--
-- Name: GardeAnimaux; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."GardeAnimaux" (
    id text NOT NULL,
    "typeAnimal" text NOT NULL,
    "nomAnimal" text NOT NULL,
    "nomClient" text NOT NULL,
    contact text,
    "dateDebut" timestamp(3) without time zone NOT NULL,
    "dateFin" timestamp(3) without time zone NOT NULL,
    tarif double precision NOT NULL,
    "typeGarde" text NOT NULL,
    statut text DEFAULT 'confirmé'::text NOT NULL,
    notes text,
    photos text[] DEFAULT ARRAY[]::text[],
    "profileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isShared" boolean DEFAULT false NOT NULL,
    source text,
    duree text
);


ALTER TABLE public."GardeAnimaux" OWNER TO jjcore_user;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    name text NOT NULL,
    avatar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Profile" OWNER TO jjcore_user;

--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    "profileId" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PushSubscription" OWNER TO jjcore_user;

--
-- Name: Recette; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."Recette" (
    id text NOT NULL,
    titre text NOT NULL,
    description text,
    ingredients text NOT NULL,
    etapes text NOT NULL,
    "tempsPrep" integer,
    "tempsCuisson" integer,
    portions integer,
    categorie text,
    image text,
    favorite boolean DEFAULT false NOT NULL,
    "profileId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Recette" OWNER TO jjcore_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: jjcore_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO jjcore_user;

--
-- Data for Name: Abonnement; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."Abonnement" (id, nom, prix, frequence, "dateDebut", "dateFin", actif, categorie, description, "profileId", "createdAt", "updatedAt") FROM stdin;
cmh8fb9g0000o4pz1lb08w179	Netflix	13.49	mensuel	2024-01-15 00:00:00	\N	t	streaming	Abonnement standard	cmh8fb9eu00014pz1jf4szsuk	2025-10-27 00:52:38.928	2025-10-27 00:52:38.928
cmh8fb9g3000q4pz107cim9wj	Spotify	9.99	mensuel	2024-03-01 00:00:00	\N	t	streaming	\N	cmh8fb9eu00014pz1jf4szsuk	2025-10-27 00:52:38.932	2025-10-27 00:52:38.932
cmh8fb9g6000s4pz1kg53a3rd	Salle de sport	39.99	mensuel	2024-09-01 00:00:00	\N	t	sport	\N	cmh8fb9eu00014pz1jf4szsuk	2025-10-27 00:52:38.935	2025-10-27 00:52:38.935
\.


--
-- Data for Name: BudgetCategory; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."BudgetCategory" (id, name, color, icon, "monthId", "createdAt", "updatedAt") FROM stdin;
cmhat6tx100064pt1nydshkre	Alimentation	#10b981	🍔	cmhat6tx100054pt1hjh32lxz	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx100074pt13x36db07	Santé	#ef4444	💊	cmhat6tx100054pt1hjh32lxz	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx100084pt1rdfa28g9	Loisir	#a855f7	🎮	cmhat6tx100054pt1hjh32lxz	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx100094pt1mi5jiizg	Achats	#f59e0b	🛍️	cmhat6tx100054pt1hjh32lxz	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000a4pt1s09aok17	Factures/Loyer	#3b82f6	🏠	cmhat6tx100054pt1hjh32lxz	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000c4pt139f11hrl	Alimentation	#10b981	🍔	cmhat6tx1000b4pt1s3ogejsi	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000d4pt1mg3sqwwm	Santé	#ef4444	💊	cmhat6tx1000b4pt1s3ogejsi	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000e4pt188hmgw24	Loisir	#a855f7	🎮	cmhat6tx1000b4pt1s3ogejsi	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000f4pt1qz02o2pm	Achats	#f59e0b	🛍️	cmhat6tx1000b4pt1s3ogejsi	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000g4pt11me486eb	Factures/Loyer	#3b82f6	🏠	cmhat6tx1000b4pt1s3ogejsi	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000i4pt1xlk60ttg	Alimentation	#10b981	🍔	cmhat6tx1000h4pt19yn0uwyd	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000j4pt1y8rrud9x	Santé	#ef4444	💊	cmhat6tx1000h4pt19yn0uwyd	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000k4pt131yp7vx0	Loisir	#a855f7	🎮	cmhat6tx1000h4pt19yn0uwyd	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000l4pt1yyh0lgm4	Achats	#f59e0b	🛍️	cmhat6tx1000h4pt19yn0uwyd	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000m4pt1y4nn36ee	Factures/Loyer	#3b82f6	🏠	cmhat6tx1000h4pt19yn0uwyd	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000o4pt1qvjjgv87	Alimentation	#10b981	🍔	cmhat6tx1000n4pt1q4f8gihn	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000p4pt1r6vp63az	Santé	#ef4444	💊	cmhat6tx1000n4pt1q4f8gihn	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000q4pt1gniqtfhu	Loisir	#a855f7	🎮	cmhat6tx1000n4pt1q4f8gihn	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000r4pt1byrawbdq	Achats	#f59e0b	🛍️	cmhat6tx1000n4pt1q4f8gihn	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000s4pt1y4m7ffwl	Factures/Loyer	#3b82f6	🏠	cmhat6tx1000n4pt1q4f8gihn	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000u4pt1kdtxnbhn	Alimentation	#10b981	🍔	cmhat6tx2000t4pt1df6iulpo	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000v4pt16ky2ldml	Santé	#ef4444	💊	cmhat6tx2000t4pt1df6iulpo	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000w4pt1xwb8hfe6	Loisir	#a855f7	🎮	cmhat6tx2000t4pt1df6iulpo	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000x4pt12a3h3cv2	Achats	#f59e0b	🛍️	cmhat6tx2000t4pt1df6iulpo	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000y4pt1lt0wf3z0	Factures/Loyer	#3b82f6	🏠	cmhat6tx2000t4pt1df6iulpo	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200104pt1d36t7d9k	Alimentation	#10b981	🍔	cmhat6tx2000z4pt1e1uxdxnx	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200114pt1ueh4wsb0	Santé	#ef4444	💊	cmhat6tx2000z4pt1e1uxdxnx	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200124pt1xqaaeph0	Loisir	#a855f7	🎮	cmhat6tx2000z4pt1e1uxdxnx	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200134pt1zcjs4rwa	Achats	#f59e0b	🛍️	cmhat6tx2000z4pt1e1uxdxnx	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200144pt17a7x3tcf	Factures/Loyer	#3b82f6	🏠	cmhat6tx2000z4pt1e1uxdxnx	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200164pt12cp451oz	Alimentation	#10b981	🍔	cmhat6tx200154pt1l8fn121s	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200174pt16pm4vhg0	Santé	#ef4444	💊	cmhat6tx200154pt1l8fn121s	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200184pt13z4zdt8e	Loisir	#a855f7	🎮	cmhat6tx200154pt1l8fn121s	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200194pt10b3lkdsl	Achats	#f59e0b	🛍️	cmhat6tx200154pt1l8fn121s	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001a4pt1pfgmjoak	Factures/Loyer	#3b82f6	🏠	cmhat6tx200154pt1l8fn121s	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001c4pt1eotlvw1l	Alimentation	#10b981	🍔	cmhat6tx2001b4pt1bcp89p0r	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001d4pt1c3l8in0y	Santé	#ef4444	💊	cmhat6tx2001b4pt1bcp89p0r	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001e4pt1x3w7tqo6	Loisir	#a855f7	🎮	cmhat6tx2001b4pt1bcp89p0r	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001f4pt12a9zszve	Achats	#f59e0b	🛍️	cmhat6tx2001b4pt1bcp89p0r	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001g4pt1xorr9npv	Factures/Loyer	#3b82f6	🏠	cmhat6tx2001b4pt1bcp89p0r	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001i4pt18dmuil3r	Alimentation	#10b981	🍔	cmhat6tx2001h4pt1g6fu23ci	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001j4pt12d5ddo5g	Santé	#ef4444	💊	cmhat6tx2001h4pt1g6fu23ci	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001k4pt1uxai13yx	Loisir	#a855f7	🎮	cmhat6tx2001h4pt1g6fu23ci	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001l4pt1k45kbi3m	Achats	#f59e0b	🛍️	cmhat6tx2001h4pt1g6fu23ci	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001m4pt1beruqr9w	Factures/Loyer	#3b82f6	🏠	cmhat6tx2001h4pt1g6fu23ci	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001o4pt1pdr79oxh	Alimentation	#10b981	🍔	cmhat6tx2001n4pt1iskjf20v	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001p4pt1ir0c1y6i	Santé	#ef4444	💊	cmhat6tx2001n4pt1iskjf20v	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001q4pt1e7eaqamv	Loisir	#a855f7	🎮	cmhat6tx2001n4pt1iskjf20v	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001r4pt1ok1g40qy	Achats	#f59e0b	🛍️	cmhat6tx2001n4pt1iskjf20v	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001s4pt19jfz1emj	Factures/Loyer	#3b82f6	🏠	cmhat6tx2001n4pt1iskjf20v	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001u4pt1wyu4k1gg	Alimentation	#10b981	🍔	cmhat6tx3001t4pt13ze4x4ea	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001v4pt1uv2nk5uv	Santé	#ef4444	💊	cmhat6tx3001t4pt13ze4x4ea	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001w4pt11ig7ekve	Loisir	#a855f7	🎮	cmhat6tx3001t4pt13ze4x4ea	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001x4pt1eer54bhr	Achats	#f59e0b	🛍️	cmhat6tx3001t4pt13ze4x4ea	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001y4pt1yn4nt93s	Factures/Loyer	#3b82f6	🏠	cmhat6tx3001t4pt13ze4x4ea	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx300204pt1gmt0xez0	Alimentation	#10b981	🍔	cmhat6tx3001z4pt193plfpvw	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx300214pt1z9qjt1z6	Santé	#ef4444	💊	cmhat6tx3001z4pt193plfpvw	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx300224pt1beh5nz0n	Loisir	#a855f7	🎮	cmhat6tx3001z4pt193plfpvw	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx300234pt1c0p3jpew	Achats	#f59e0b	🛍️	cmhat6tx3001z4pt193plfpvw	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx300244pt106gfymyv	Factures/Loyer	#3b82f6	🏠	cmhat6tx3001z4pt193plfpvw	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhatn36p002p4pt15wzd0bta	Alimentation	#10b981	🍔	cmhatn36p002o4pt15n8b5me9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36p002q4pt1pxwkqw9y	Santé	#ef4444	💊	cmhatn36p002o4pt15n8b5me9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36p002r4pt1x5b3fgvl	Loisir	#a855f7	🎮	cmhatn36p002o4pt15n8b5me9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002s4pt1zyo2xe6w	Achats	#f59e0b	🛍️	cmhatn36p002o4pt15n8b5me9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002t4pt1f7qru74c	Factures/Loyer	#3b82f6	🏠	cmhatn36p002o4pt15n8b5me9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002v4pt19lcihmwo	Alimentation	#10b981	🍔	cmhatn36q002u4pt1uwuj7sfp	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002w4pt1i59aprzg	Santé	#ef4444	💊	cmhatn36q002u4pt1uwuj7sfp	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002x4pt1vmmm1jjt	Loisir	#a855f7	🎮	cmhatn36q002u4pt1uwuj7sfp	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002y4pt1cv96t0yt	Achats	#f59e0b	🛍️	cmhatn36q002u4pt1uwuj7sfp	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002z4pt1f412290t	Factures/Loyer	#3b82f6	🏠	cmhatn36q002u4pt1uwuj7sfp	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00314pt1t2f25vi3	Alimentation	#10b981	🍔	cmhatn36q00304pt1m8lz6lmt	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00324pt1cz7juykx	Santé	#ef4444	💊	cmhatn36q00304pt1m8lz6lmt	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00334pt170ktn1qk	Loisir	#a855f7	🎮	cmhatn36q00304pt1m8lz6lmt	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00344pt1e7dtyx68	Achats	#f59e0b	🛍️	cmhatn36q00304pt1m8lz6lmt	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00354pt1l3k2g8z0	Factures/Loyer	#3b82f6	🏠	cmhatn36q00304pt1m8lz6lmt	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00374pt18vockjvc	Alimentation	#10b981	🍔	cmhatn36q00364pt18wpqha1m	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00384pt1vbqjx4hw	Santé	#ef4444	💊	cmhatn36q00364pt18wpqha1m	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00394pt173gmfwd0	Loisir	#a855f7	🎮	cmhatn36q00364pt18wpqha1m	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003a4pt1bmafyp3c	Achats	#f59e0b	🛍️	cmhatn36q00364pt18wpqha1m	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003b4pt1croyqo1e	Factures/Loyer	#3b82f6	🏠	cmhatn36q00364pt18wpqha1m	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003d4pt1kvwg5z7n	Alimentation	#10b981	🍔	cmhatn36q003c4pt1mnp4yv6v	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003e4pt1rurdbq7p	Santé	#ef4444	💊	cmhatn36q003c4pt1mnp4yv6v	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003f4pt1z2jxap8v	Loisir	#a855f7	🎮	cmhatn36q003c4pt1mnp4yv6v	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003g4pt1jkpejvu2	Achats	#f59e0b	🛍️	cmhatn36q003c4pt1mnp4yv6v	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003h4pt1l27o8ezq	Factures/Loyer	#3b82f6	🏠	cmhatn36q003c4pt1mnp4yv6v	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003j4pt1ae0lqcy3	Alimentation	#10b981	🍔	cmhatn36q003i4pt1vzj4e34t	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003k4pt17spss1yy	Santé	#ef4444	💊	cmhatn36q003i4pt1vzj4e34t	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003l4pt10ykggngx	Loisir	#a855f7	🎮	cmhatn36q003i4pt1vzj4e34t	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003m4pt1hlvo08ao	Achats	#f59e0b	🛍️	cmhatn36q003i4pt1vzj4e34t	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003n4pt153wn8bgi	Factures/Loyer	#3b82f6	🏠	cmhatn36q003i4pt1vzj4e34t	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003p4pt18l6pzgq2	Alimentation	#10b981	🍔	cmhatn36r003o4pt16kgoqg6l	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003q4pt1ewwyemeu	Santé	#ef4444	💊	cmhatn36r003o4pt16kgoqg6l	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003r4pt1msr0rvyt	Loisir	#a855f7	🎮	cmhatn36r003o4pt16kgoqg6l	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003s4pt1iqnsyutb	Achats	#f59e0b	🛍️	cmhatn36r003o4pt16kgoqg6l	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003t4pt1xedg1l22	Factures/Loyer	#3b82f6	🏠	cmhatn36r003o4pt16kgoqg6l	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003v4pt1439usjxl	Alimentation	#10b981	🍔	cmhatn36r003u4pt1j3i2xnyy	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003w4pt1wqujzotn	Santé	#ef4444	💊	cmhatn36r003u4pt1j3i2xnyy	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003x4pt115pi1u65	Loisir	#a855f7	🎮	cmhatn36r003u4pt1j3i2xnyy	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003y4pt1pl8ffd52	Achats	#f59e0b	🛍️	cmhatn36r003u4pt1j3i2xnyy	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003z4pt15all83tq	Factures/Loyer	#3b82f6	🏠	cmhatn36r003u4pt1j3i2xnyy	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00414pt1z2do99tw	Alimentation	#10b981	🍔	cmhatn36r00404pt1nseovfdu	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00424pt1ewaebhot	Santé	#ef4444	💊	cmhatn36r00404pt1nseovfdu	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00434pt1ug0tn2t8	Loisir	#a855f7	🎮	cmhatn36r00404pt1nseovfdu	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00444pt19rn5pgrp	Achats	#f59e0b	🛍️	cmhatn36r00404pt1nseovfdu	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00454pt1l03u5pn9	Factures/Loyer	#3b82f6	🏠	cmhatn36r00404pt1nseovfdu	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00474pt1s5s0qtet	Alimentation	#10b981	🍔	cmhatn36r00464pt1m94fh8ot	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00484pt1pnopkx3t	Santé	#ef4444	💊	cmhatn36r00464pt1m94fh8ot	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00494pt11ttstmcp	Loisir	#a855f7	🎮	cmhatn36r00464pt1m94fh8ot	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004a4pt1j1mjk37l	Achats	#f59e0b	🛍️	cmhatn36r00464pt1m94fh8ot	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004b4pt1so1yn3ic	Factures/Loyer	#3b82f6	🏠	cmhatn36r00464pt1m94fh8ot	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004d4pt1ero0fzs2	Alimentation	#10b981	🍔	cmhatn36r004c4pt1mzykrnj9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004e4pt1n6d526ez	Santé	#ef4444	💊	cmhatn36r004c4pt1mzykrnj9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004f4pt1mqxd611f	Loisir	#a855f7	🎮	cmhatn36r004c4pt1mzykrnj9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004g4pt1to5ev2na	Achats	#f59e0b	🛍️	cmhatn36r004c4pt1mzykrnj9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004h4pt1yqpygal7	Factures/Loyer	#3b82f6	🏠	cmhatn36r004c4pt1mzykrnj9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004j4pt1fsbzzntt	Alimentation	#10b981	🍔	cmhatn36r004i4pt1e1gn6fxo	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004k4pt11b2eefwg	Santé	#ef4444	💊	cmhatn36r004i4pt1e1gn6fxo	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004l4pt1u3vctvei	Loisir	#a855f7	🎮	cmhatn36r004i4pt1e1gn6fxo	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004m4pt1cyxy54lt	Achats	#f59e0b	🛍️	cmhatn36r004i4pt1e1gn6fxo	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004n4pt1f2cwhb23	Factures/Loyer	#3b82f6	🏠	cmhatn36r004i4pt1e1gn6fxo	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhaxa415008x4pt16smlbgst	Abonnements 	#ff6a00	🗓	cmhatn36p002o4pt15n8b5me9	2025-10-28 18:51:10.698	2025-10-28 18:51:10.698
cmhaxa419008y4pt1ey1tbosv	Abonnements 	#ff6a00	🗓	cmhatn36q002u4pt1uwuj7sfp	2025-10-28 18:51:10.701	2025-10-28 18:51:10.701
cmhaxa41c008z4pt16wbba8l9	Abonnements 	#ff6a00	🗓	cmhatn36q00304pt1m8lz6lmt	2025-10-28 18:51:10.704	2025-10-28 18:51:10.704
cmhaxa41e00904pt1oek6hveu	Abonnements 	#ff6a00	🗓	cmhatn36q00364pt18wpqha1m	2025-10-28 18:51:10.707	2025-10-28 18:51:10.707
cmhaxa41h00914pt1t0igdlwg	Abonnements 	#ff6a00	🗓	cmhatn36q003c4pt1mnp4yv6v	2025-10-28 18:51:10.709	2025-10-28 18:51:10.709
cmhaxa41j00924pt19mfcjy6c	Abonnements 	#ff6a00	🗓	cmhatn36q003i4pt1vzj4e34t	2025-10-28 18:51:10.712	2025-10-28 18:51:10.712
cmhaxa41m00934pt11zac8bpd	Abonnements 	#ff6a00	🗓	cmhatn36r003o4pt16kgoqg6l	2025-10-28 18:51:10.714	2025-10-28 18:51:10.714
cmhaxa41o00944pt1hadrvktu	Abonnements 	#ff6a00	🗓	cmhatn36r003u4pt1j3i2xnyy	2025-10-28 18:51:10.717	2025-10-28 18:51:10.717
cmhaxa41r00954pt1htp8u5d6	Abonnements 	#ff6a00	🗓	cmhatn36r00404pt1nseovfdu	2025-10-28 18:51:10.719	2025-10-28 18:51:10.719
cmhaxa41t00964pt1op78zibg	Abonnements 	#ff6a00	🗓	cmhatn36r00464pt1m94fh8ot	2025-10-28 18:51:10.722	2025-10-28 18:51:10.722
cmhaxa41w00974pt1sa07ij2d	Abonnements 	#ff6a00	🗓	cmhatn36r004c4pt1mzykrnj9	2025-10-28 18:51:10.725	2025-10-28 18:51:10.725
cmhaxa41z00984pt1tq4qoyr4	Abonnements 	#ff6a00	🗓	cmhatn36r004i4pt1e1gn6fxo	2025-10-28 18:51:10.727	2025-10-28 18:51:10.727
\.


--
-- Data for Name: BudgetExpense; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."BudgetExpense" (id, description, amount, date, "categoryId", "monthId", "profileId", "isShared", "createdAt", "updatedAt") FROM stdin;
cmhauf700005h4pt1h7ssgcq6	Amazon Tooli Art	40.99	2025-10-28 17:31:08.848	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 17:31:08.976	2025-10-28 17:31:08.976
cmhavvfal005l4pt1rjoli5ne	Aldi	51.17	2025-10-28 18:11:45.695	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:11:45.838	2025-10-28 18:11:45.838
cmhavvszb005n4pt14wk4qdcq	Esthéticienne 	34	2025-10-28 18:12:03.443	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:12:03.576	2025-10-28 18:12:03.576
cmhavwrlu005p4pt1f0kdhjpl	Pharmacie	106.82	2025-10-28 18:12:48.296	cmhatn36r00484pt1pnopkx3t	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:12:48.451	2025-10-28 18:12:48.451
cmhavxa10005r4pt10mwmnl7d	Intermarché	7.23	2025-10-28 18:13:12.218	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:13:12.324	2025-10-28 18:13:12.324
cmhavxkan005t4pt1vjoku1d4	Naturalia	13.5	2025-10-28 18:13:25.474	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:13:25.631	2025-10-28 18:13:25.631
cmhavy1a5005v4pt1jtyxee1n	Train	52.5	2025-10-28 18:13:47.516	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:13:47.645	2025-10-28 18:13:47.645
cmhavyj46005x4pt18t9lmfqs	Tcl	10	2025-10-28 18:14:10.623	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:14:10.759	2025-10-28 18:14:10.759
cmhavzd5w00614pt1b68h860g	Action	17.66	2025-10-28 18:14:49.573	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:14:49.701	2025-10-28 18:14:49.701
cmhavzypl00634pt1twd14w7k	Decathlon 	9.99	2025-10-28 18:15:17.494	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:15:17.626	2025-10-28 18:15:17.626
cmhaw0a5f00654pt175d5hz90	Greekia	15	2025-10-28 18:15:32.324	cmhatn36r00494pt11ttstmcp	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:15:32.451	2025-10-28 18:15:32.451
cmhaw0ne800674pt1gwzj31x4	Train	54	2025-10-28 18:15:49.497	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:15:49.617	2025-10-28 18:15:49.617
cmhaw2d8d00694pt1itolg7au	Téléphone	8	2025-10-28 18:17:09.59	cmhatn36r004b4pt1so1yn3ic	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:17:09.758	2025-10-28 18:17:09.758
cmhaw2i47006b4pt1k6byfu66	Internet	12	2025-10-28 18:17:15.848	cmhatn36r004b4pt1so1yn3ic	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:17:16.087	2025-10-28 18:17:16.087
cmhaw2rli006d4pt1bxovp7ws	Électricité 	30	2025-10-28 18:17:28.239	cmhatn36r004b4pt1so1yn3ic	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:17:28.375	2025-10-28 18:17:28.375
cmhawd8o6006l4pt1vcouysvf	Dermatologue	200	2025-10-28 18:25:36.886	cmhatn36r00484pt1pnopkx3t	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:25:37.062	2025-10-28 18:25:37.062
cmhaw42qj006f4pt188e66rki	Drainage lymphatique 	80	2025-10-28 18:18:29.263	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:18:29.468	2025-10-28 18:26:07.759
cmhawek4u006n4pt1c2n6kinm	Aldi	32.34	2025-10-28 18:26:38.371	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:26:38.575	2025-10-28 18:26:38.575
cmhawfigk006p4pt1vl5ocoe5	Nuancier feutre	7.5	2025-10-28 18:27:22.858	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:27:23.06	2025-10-28 18:27:23.06
cmhawh3v4006r4pt1dh8v75w7	Amazon coloriage	35.84	2025-10-28 18:28:37.216	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:28:37.456	2025-10-28 18:28:37.456
cmhawhhxz006t4pt1u2f48hhz	Pharmacie	9.16	2025-10-28 18:28:55.417	cmhatn36r00484pt1pnopkx3t	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:28:55.704	2025-10-28 18:28:55.704
cmhawhym0006v4pt10kzah2zn	Amazon 	44.99	2025-10-28 18:29:17.023	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:29:17.304	2025-10-28 18:29:17.304
cmhawiajs006x4pt1zcdpno85	Uniqlo	95	2025-10-28 18:29:32.622	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:29:32.777	2025-10-28 18:29:32.777
cmhawlm2e00714pt1kl456af9	Amazon	4.99	2025-10-28 18:32:07.459	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:32:07.67	2025-10-28 18:32:07.67
cmhawlyx900734pt1sm86sxvg	Sac mango	34.94	2025-10-28 18:32:23.887	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:32:24.333	2025-10-28 18:32:24.333
cmhawnbzp00774pt1yaecwf8x	Action	11.5	2025-10-28 18:33:27.72	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:33:27.925	2025-10-28 18:33:27.925
cmhawnn0800794pt1q9v2qdbf	Intermarché	5.66	2025-10-28 18:33:42.003	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:33:42.2	2025-10-28 18:33:42.2
cmhawnu4u007b4pt1vsut58wn	La vie claire	2.99	2025-10-28 18:33:51.156	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:33:51.438	2025-10-28 18:33:51.438
cmhawo3ej007d4pt1qmvmo06w	Rhonexpress	10.5	2025-10-28 18:34:03.184	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:34:03.451	2025-10-28 18:34:03.451
cmhawpg6e007f4pt1hs737y2v	Boulangerie	4.7	2025-10-28 18:35:06.314	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:35:06.662	2025-10-28 18:35:06.662
cmhawpnp8007h4pt1f878xlkd	Carrefour	3.54	2025-10-28 18:35:16.217	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:35:16.412	2025-10-28 18:35:16.412
cmhawpwp3007j4pt1efx8e89d	Mcdo	41.6	2025-10-28 18:35:27.905	cmhatn36r00494pt11ttstmcp	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:35:28.072	2025-10-28 18:35:28.072
cmhawq445007l4pt1pdqumngl	Naturalia	13.5	2025-10-28 18:35:37.459	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:35:37.685	2025-10-28 18:35:37.685
cmhawqnot007n4pt16sx4mlia	Fourvière	18	2025-10-28 18:36:02.648	cmhatn36r00494pt11ttstmcp	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:36:03.053	2025-10-28 18:36:03.053
cmhawrfrm007p4pt1e7xn2e78	Intermarché	38	2025-10-28 18:36:39.279	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:36:39.442	2025-10-28 18:36:39.442
cmhawrmnf007r4pt1m71fvgf7	Train	60	2025-10-28 18:36:48.193	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:36:48.363	2025-10-28 18:36:48.363
cmhaws6nv007t4pt1068v8ie0	Sushi	30	2025-10-28 18:37:14.019	cmhatn36r00494pt11ttstmcp	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:37:14.299	2025-10-28 18:37:14.299
cmhawsf84007v4pt1a1euz7ml	Sourcil	300	2025-10-28 18:37:25.218	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:37:25.397	2025-10-28 18:37:25.397
cmhaufkwy005j4pt1mb75tbe9	Amazon posca 	19.87	2025-10-28 17:31:26.888	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 17:31:27.011	2025-10-28 18:45:12.552
cmhaxb10p009m4pt13cf9j43b	Tcl	74.1	2025-10-28 18:51:53.234	cmhaxa41t00964pt1op78zibg	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:51:53.449	2025-10-28 18:51:53.449
cmhaxbjxv009o4pt1n0qjfom6	Basic fit	24.99	2025-10-28 18:52:17.615	cmhaxa41t00964pt1op78zibg	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:52:17.972	2025-10-28 18:52:17.972
cmhaxpzcy00a84pt12s846dzr	Esthéticienne 	34	2025-10-28 19:03:30.892	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 19:03:31.138	2025-10-28 19:03:31.138
cmhayjipj00014pl3l0x3in2c	Pharmacie 	38.63	2025-10-28 19:26:28.992	cmhatn36r00484pt1pnopkx3t	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 19:26:29.239	2025-10-28 19:26:29.239
cmhayu8gs00014pbwsfba9618	Pharmacie	20.27	2025-10-28 19:34:48.874	cmhatn36r00484pt1pnopkx3t	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 19:34:49.181	2025-10-28 19:34:49.181
cmhb2wn5b000p4pe6x2w0yidj	Sac à dos zalando	49.95	2025-10-28 21:28:39.757	cmhatn36r004a4pt1j1mjk37l	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 21:28:39.984	2025-10-28 21:28:39.984
cmhc0onqd000z4pbh5luxec53	Intermarché	14.41	2025-10-29 13:14:14.436	cmhatn36r00474pt1s5s0qtet	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-29 13:14:14.437	2025-10-29 13:40:02.603
cmhgewgha000j4pmpn9vm4in6	Salle Wellness	59	2025-11-01 15:03:17.536	cmhaxa41w00974pt1sa07ij2d	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-01 15:03:17.614	2025-11-01 15:03:17.614
cmhgexcqx000n4pmp2nz9bzvg	Licence Wellness	89	2025-11-01 15:03:59.384	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-01 15:03:59.433	2025-11-01 15:04:22.88
cmhgeybaq000p4pmpnm84ttt8	2 mois Wellness	118	2025-11-01 15:04:44.163	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-01 15:04:44.21	2025-11-01 15:04:44.21
cmhj4nwb9000l4pppqnvbi5mk	Intermarché	4.96	2025-11-03 12:40:00.462	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-03 12:40:00.597	2025-11-03 12:40:00.597
cmhj4o54q000p4ppp2pptmekl	TCL	74.1	2025-11-03 12:40:11.886	cmhaxa41w00974pt1sa07ij2d	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-03 12:40:12.026	2025-11-03 12:40:12.026
cmhj4ohgb000t4pppbync85rk	TCL	2.1	2025-11-03 12:40:27.874	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-03 12:40:27.995	2025-11-03 12:40:27.995
cmhj4qih0000x4pppyu4k8tco	Naturalia	13.5	2025-11-03 12:42:02.493	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-03 12:42:02.629	2025-11-03 12:42:02.629
cmhjta8pt000u4pj9x63s5qkn	Test	30	2025-11-04 00:09:13.778	cmhat6tx3001u4pt1wyu4k1gg	cmhat6tx3001t4pt13ze4x4ea	cmh8fb9eu00014pz1jf4szsuk	f	2025-11-04 00:09:13.89	2025-11-04 00:09:13.89
cmhke5oxa00084pgbn42ap3ws	Amazon madeleine	17.95	2025-11-04 09:53:33.55	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-04 09:53:33.551	2025-11-04 09:53:33.551
cmhq670ik002z4pqqdy1bs4vy	Maison du monde	6.99	2025-11-08 10:57:15.315	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-08 10:57:15.356	2025-11-08 10:57:15.356
cmhq67g8d00314pqqyc2lvdc1	Amazon meubles	62	2025-11-08 10:57:35.621	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-08 10:57:35.725	2025-11-08 10:57:35.725
cmhq67ycw00334pqqen1jh1tw	Flyingtiger	13	2025-11-08 10:57:59.096	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-08 10:57:59.216	2025-11-08 10:57:59.216
cmhq68dh700354pqqeea1qdz0	Action	17	2025-11-08 10:58:18.767	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-08 10:58:18.812	2025-11-08 10:58:18.812
cmhq68smg00394pqqyyiyishp	Intermarché	31	2025-11-08 10:58:38.4	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-08 10:58:38.441	2025-11-08 10:58:38.441
cmhq6srgg003d4pqqdtqd8000	TCL	4.2	2025-11-08 11:14:09.982	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-08 11:14:10.048	2025-11-08 11:14:10.048
cmhs4don5003v4pqquhpazdey	Intermarché	8.11	2025-11-09 19:41:59.558	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-09 19:41:59.681	2025-11-09 19:41:59.681
cmhs4e4e7003z4pqqlvrlb8e5	Abonnement Sittsy	29	2025-11-09 19:42:20.035	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-09 19:42:20.096	2025-11-09 19:42:20.096
cmht9i6m2004h4pqql9kfoyud	Drainage ostéopathe 	65	2025-11-10 14:53:13.724	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-10 14:53:13.85	2025-11-10 14:53:13.85
cmht9jlq4004n4pqqwyqh4t5v	Vismed	15	2025-11-10 14:54:19.985	cmhatn36r004e4pt1n6d526ez	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-10 14:54:20.093	2025-11-10 14:54:20.093
cmhtb2way005f4pqqvw7vhng9	Boulangerie 	3	2025-11-10 15:37:19.8	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-10 15:37:19.882	2025-11-10 15:37:19.882
cmhujiyq1005x4pqqrqn2w35o	Pitaya 	14	2025-11-11 12:21:32.58	cmhatn36r004f4pt1mqxd611f	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-11 12:21:32.617	2025-11-11 12:21:32.617
cmhuvbond006j4pqqpg3nkn0z	Cadeau Loreen	54	2025-11-11 17:51:48.305	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-11 17:51:48.362	2025-11-11 17:51:48.362
cmhwfe7tp006z4pqqj7ck8zep	Cadeau Loreen	24	2025-11-12 20:01:24.955	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-12 20:01:25.021	2025-11-12 20:01:25.021
cmhxjrvzw00834pqqsilwmhsr	Diététicienne 	60	2025-11-13 14:51:47.385	cmhatn36r004e4pt1n6d526ez	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 14:51:47.516	2025-11-13 14:51:47.516
cmhxwm2ug008l4pqq89a01vsr	Loyer	178	2025-11-13 20:51:11.427	cmhatn36r004h4pt1yqpygal7	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 20:51:11.464	2025-11-13 20:51:11.464
cmhujj9g400614pqqj7bia9w0	Parking resto	5	2025-11-11 12:21:46.481	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-11 12:21:46.516	2025-11-13 20:51:17.713
cmht9jzxs004t4pqqjia5c9pj	Cadeau Margaux 	16	2025-11-10 14:54:38.399	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-10 14:54:38.512	2025-11-13 20:51:22.989
cmhxwmw1l008t4pqq1h0hlnqh	Eau	9.5	2025-11-13 20:51:49.26	cmhatn36r004h4pt1yqpygal7	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 20:51:49.306	2025-11-13 20:51:49.306
cmhxwn8nf008v4pqqn4ei6z71	Abonnement 	3.5	2025-11-13 20:52:05.605	cmhatn36r004h4pt1yqpygal7	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 20:52:05.643	2025-11-13 20:52:05.643
cmhxwni98008x4pqq3w45tjej	Électricité 	33.5	2025-11-13 20:52:18.058	cmhatn36r004h4pt1yqpygal7	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 20:52:18.092	2025-11-13 20:52:18.092
cmhxwnwl600994pqqohxserrd	Palworld	28	2025-11-13 20:52:36.632	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 20:52:36.666	2025-11-13 20:52:36.666
cmhxwofmk009j4pqq857nuamx	Téléphone	8	2025-11-13 20:53:01.303	cmhaxa41w00974pt1sa07ij2d	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 20:53:01.34	2025-11-13 20:53:01.34
cmhxxzr8000a14pqqwne01g45	Cadeau Christele	30	2025-11-13 21:29:49.11	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-13 21:29:49.2	2025-11-13 21:29:49.2
cmhyegcnz00b34pqqlu2irya9	Resto anniv Margaux	33	2025-11-14 05:10:37.291	cmhatn36r004f4pt1mqxd611f	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-14 05:10:37.344	2025-11-14 05:10:37.344
cmi0b2kcg00cd4pqq95ro1ia9	Gel pens	30.22	2025-11-15 13:11:27.51	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-15 13:11:27.616	2025-11-15 13:11:27.616
cmi2woubx00dn4pqq7fm1otyc	Boulangerie 	6.8	2025-11-17 08:52:11.21	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-17 08:52:11.278	2025-11-17 08:52:11.278
cmi47j6nr00e34pqq0cqr0bun	Intermarché 	1.87	2025-11-18 06:43:29.166	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-18 06:43:29.271	2025-11-18 06:43:29.271
cmi47jxsa00e54pqqlzw2m86z	Intermarché	37.81	2025-11-18 06:44:04.251	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-18 06:44:04.426	2025-11-18 09:53:58.678
cmi4ueiau00ez4pqq2cdpp0zi	Intermarché 	17	2025-11-18 17:23:42.097	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-18 17:23:42.247	2025-11-18 17:23:42.247
cmi5xv4y900fh4pqqcfrrfabz	Psy	70	2025-11-19 11:48:23.065	cmhatn36r004e4pt1n6d526ez	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-19 11:48:23.121	2025-11-19 11:48:23.121
cmibi31od00gj4pqq1dk6v9i6	Bar à jeux	37.34	2025-11-23 09:13:15.304	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-23 09:13:15.326	2025-11-23 09:13:15.326
cmibi390600gl4pqq9em6y24l	Train Paris	5	2025-11-23 09:13:24.802	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-23 09:13:24.822	2025-11-23 09:13:24.822
cmibqyj8u00hn4pqq8t8tvji7	Burger king	32.5	2025-11-23 13:21:41.285	cmhatn36r004f4pt1mqxd611f	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-23 13:21:41.358	2025-11-23 13:21:41.358
cmidnv8bm00jf4pqqwfbajgma	5five	25.96	2025-11-24 21:30:40.364	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-24 21:30:40.738	2025-11-24 21:30:40.738
cmiel2ohn00jn4pqqavpiclw9	Intermarché 	9.09	2025-11-25 13:00:15.61	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-25 13:00:15.611	2025-11-25 13:00:15.611
cmiggck8r00lj4pqqtyhp91fc	Crêpes	10	2025-11-26 20:23:30.939	cmhatn36r004f4pt1mqxd611f	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-26 20:23:30.939	2025-11-26 20:23:30.939
cmiggcryu00ll4pqqv2mo9ooa	Déco	25	2025-11-26 20:23:40.949	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-26 20:23:40.95	2025-11-26 20:23:40.95
cmih3kzys00mh4pqqwbgoduum	Train	1.8	2025-11-27 07:13:55.558	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-27 07:13:55.732	2025-11-27 07:13:55.732
cmih3lvh600nh4pqqtagg5dv7	TCL	74.1	2025-11-27 07:14:36.414	cmhaxa41z00984pt1tq4qoyr4	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-27 07:14:36.57	2025-11-27 07:14:36.57
cmih3wqo000nn4pqq2u2kifin	Téléphone	8	2025-11-27 07:23:03.413	cmhaxa41z00984pt1tq4qoyr4	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-27 07:23:03.552	2025-11-27 07:23:03.552
cmih3x6hy00o94pqqq40apf1a	Salle	59	2025-11-27 07:23:23.945	cmhaxa41z00984pt1tq4qoyr4	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-27 07:23:24.07	2025-11-27 07:23:24.07
cmihi9w2800oh4pqq7scdj57m	Esthéticienne 	34	2025-11-27 14:05:11.695	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-27 14:05:11.696	2025-11-27 14:05:11.696
cmivtt3kv016l4pqqzdsv0okv	Noël	34.98	2025-12-07 14:36:50.055	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-07 14:36:50.144	2025-12-07 14:36:50.144
cmiktebte00px4pqqgehvqckf	Père Noël mystère	40	2025-11-29 21:39:52.974	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-29 21:39:53.043	2025-11-29 21:39:53.043
cmikwttfh00qv4pqqanid2bnd	Noël	30.38	2025-11-29 23:15:54.517	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-29 23:15:54.557	2025-11-29 23:15:54.557
cmikufar800qd4pqq7sxs029f	Noël	47.69	2025-11-29 22:08:37.823	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-29 22:08:37.94	2025-11-29 23:16:45.808
cmiljsg0200rh4pqqnty07bdx	Noël	27.99	2025-11-30 09:58:41.622	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-30 09:58:41.666	2025-11-30 09:58:41.666
cmilzu48j00s54pqqiabfv2kk	Boulangerie	4.5	2025-11-30 17:27:53.487	cmhatn36r004d4pt1ero0fzs2	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-30 17:27:53.588	2025-11-30 17:27:53.588
cmivu43wh016r4pqqsybolipy	Noël	34.99	2025-12-07 14:45:23.677	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-07 14:45:23.777	2025-12-07 14:45:23.777
cmiexh4la00kj4pqqrccb1dg5	Temu	32	2025-11-25 18:47:24.93	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-25 18:47:25.054	2025-12-01 11:43:56.397
cminnya0i00uz4pqqqnfj0u92	Noël	170.99	2025-12-01 21:30:44.609	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-01 21:30:44.658	2025-12-01 21:30:44.658
cmino9h1a00vl4pqqy8t6hh7u	Noël	74.99	2025-12-01 21:39:26.898	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-01 21:39:26.974	2025-12-01 21:39:26.974
cmilztwhc00rz4pqq6xgb0n02	Noël	28	2025-11-30 17:27:43.438	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-30 17:27:43.536	2025-12-01 21:39:40.817
cmilztmcw00rx4pqq3qywf3jk	Noël	37.99	2025-11-30 17:27:30.231	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-30 17:27:30.416	2025-12-01 21:39:47.567
cmicqudcn00it4pqqq0aqrhjj	Noël	104	2025-11-24 06:06:13.222	cmhatn36r004g4pt1to5ev2na	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-24 06:06:13.271	2025-12-01 21:39:58.529
cmioy98in00xl4pqqb5xe9k8b	Noël	10	2025-12-02 19:06:58.132	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-02 19:06:58.271	2025-12-02 19:06:58.271
cmiqo3iis00yh4pqqxgntrump	Les audacieuses	33.59	2025-12-03 23:58:07.4	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-03 23:58:07.492	2025-12-03 23:58:07.492
cmirziizn00zz4pqq4sqo3k3b	Loyer	148	2025-12-04 22:05:29.797	cmhatn36r004n4pt1f2cwhb23	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-04 22:05:29.891	2025-12-04 22:05:29.891
cmirzn8b9010n4pqqdbi1kjbe	Prime	800	2025-12-04 22:09:09.242	cmhatn36r004l4pt1u3vctvei	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-04 22:09:09.333	2025-12-04 22:09:09.333
cmisi2q3801254pqqqeu5q13v	Noël	39.99	2025-12-05 06:45:03.237	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-05 06:45:05.301	2025-12-05 06:45:05.301
cmitfvqfs012l4pqqvh9cowz5	Karaoke	20	2025-12-05 22:31:26.085	cmhatn36r004l4pt1u3vctvei	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-05 22:31:26.104	2025-12-05 22:31:26.104
cmirzjir201074pqqpi55u3q9	Noël 	75	2025-12-04 22:06:16.144	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-04 22:06:16.238	2025-12-05 23:48:37.591
cmiuip4ou01474pqq3xc129nl	Monoprix	29.74	2025-12-06 16:38:02.931	cmhatn36r004j4pt1fsbzzntt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-06 16:38:03.006	2025-12-06 16:38:03.006
cmiuipo2e01494pqqpgasaqad	Intermarché	6.85	2025-12-06 16:38:28.045	cmhatn36r004j4pt1fsbzzntt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-06 16:38:28.118	2025-12-06 16:38:28.118
cmiul7hk6014r4pqq67q382jg	Noël	25.99	2025-12-06 17:48:18.658	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-06 17:48:18.727	2025-12-06 17:48:18.727
cmiw9j7fu017v4pqqkc72pa8x	Noël	22.99	2025-12-07 21:57:02.397	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-07 21:57:02.442	2025-12-07 21:57:02.442
cmix7lmei018d4pqqutvgwa58	Intermarché	15.64	2025-12-08 13:50:42.031	cmhatn36r004j4pt1fsbzzntt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-08 13:50:42.09	2025-12-08 13:50:42.09
cmiy4o6jg018v4pqqdi8g1wqd	Burger	26	2025-12-09 05:16:28.789	cmhatn36r004l4pt1u3vctvei	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-09 05:16:28.829	2025-12-09 05:16:28.829
cmiyn2y7p019t4pqqsawjmf0s	Sourcil	30	2025-12-09 13:51:50.927	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-09 13:51:50.965	2025-12-09 13:51:50.965
cmiyn33yo019z4pqqw9jtg1po	TCL	4.2	2025-12-09 13:51:58.376	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-09 13:51:58.417	2025-12-10 05:39:18.422
cmj0bhmji01az4pqqxp4p8p8p	Noël	30	2025-12-10 18:02:52.541	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-10 18:02:52.638	2025-12-10 18:02:52.638
cmj0zhh1w01bf4pqq8uybjpzp	Noël	30.98	2025-12-11 05:14:36.27	cmhatn36r004m4pt1cyxy54lt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-11 05:14:36.306	2025-12-11 05:14:36.306
cmj365qwu000f4p6et4z5gc8j	Intermarché	45.04	2025-12-12 17:56:58.842	cmhatn36r004j4pt1fsbzzntt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-12 17:56:58.879	2025-12-12 17:56:58.879
cmj366gbn000n4p6eq7ofri6b	Chocolats	13.15	2025-12-12 17:57:31.781	cmhatn36r004j4pt1fsbzzntt	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-12 17:57:31.811	2025-12-12 17:57:31.811
\.


--
-- Data for Name: BudgetIncome; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."BudgetIncome" (id, description, amount, date, "monthId", "profileId", "isShared", "createdAt", "updatedAt") FROM stdin;
cmhatq5i9005d4pt1tnoit114	Salaire 	1928.56	2025-10-28 17:11:40.048	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 17:11:40.641	2025-10-28 17:11:40.641
cmhauajp1005f4pt1a331js11	Caf	143.95	2025-10-28 17:27:31.97	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 17:27:32.129	2025-10-28 17:27:32.129
cmhawk0jm006z4pt1hto20vbo	Remb sécu dermato 	50.66	2025-10-28 18:30:52.811	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:30:53.099	2025-10-28 18:30:53.099
cmhawmsk600754pt1lzb1i9vq	Remb mutuelle dermato 	50.94	2025-10-28 18:33:02.6	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:33:02.742	2025-10-28 18:33:02.742
cmhaxi0bj009y4pt1b59kbk2l	Salaire	1699.82	2025-10-28 18:57:18.961	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:57:19.134	2025-10-28 18:57:19.134
cmhaw49e2006h4pt1l1xc3fe4	Remb mutuelle drainage	45	2025-10-28 18:18:37.86	cmhatn36r00464pt1m94fh8ot	cmh8fb9ez00024pz1p3qi2dyr	f	2025-10-28 18:18:38.09	2025-10-29 05:15:40.661
cmhl3y7l2001v4pqqxtmbgl3a	Caf	143.95	2025-11-04 21:55:34.478	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-04 21:55:34.503	2025-11-04 21:55:34.503
cmht9ijs0004j4pqqpa6s0fmj	Remboursement drainage mutuelle	45	2025-11-10 14:53:30.443	cmhatn36r004c4pt1mzykrnj9	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-10 14:53:30.912	2025-11-10 14:53:30.912
cmih3ldio00mr4pqqdqzlc71e	Salaire	2473.25	2025-11-27 07:14:13.132	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-11-27 07:14:13.296	2025-11-27 07:14:13.296
cmiu9nj0t013h4pqq5feu0sa7	CAF	31.41	2025-12-06 12:24:51.7	cmhatn36r004i4pt1e1gn6fxo	cmh8fb9ez00024pz1p3qi2dyr	f	2025-12-06 12:24:51.725	2025-12-06 12:24:51.725
\.


--
-- Data for Name: BudgetMonth; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."BudgetMonth" (id, month, "yearId", "createdAt", "updatedAt") FROM stdin;
cmhat6tx100054pt1hjh32lxz	1	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000b4pt1s3ogejsi	2	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000h4pt19yn0uwyd	3	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx1000n4pt1q4f8gihn	4	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000t4pt1df6iulpo	5	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2000z4pt1e1uxdxnx	6	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx200154pt1l8fn121s	7	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001b4pt1bcp89p0r	8	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001h4pt1g6fu23ci	9	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx2001n4pt1iskjf20v	10	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001t4pt13ze4x4ea	11	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhat6tx3001z4pt193plfpvw	12	cmhat6tx000044pt1yd6ufkhc	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhatn36p002o4pt15n8b5me9	1	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q002u4pt1uwuj7sfp	2	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00304pt1m8lz6lmt	3	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q00364pt18wpqha1m	4	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003c4pt1mnp4yv6v	5	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36q003i4pt1vzj4e34t	6	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003o4pt16kgoqg6l	7	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r003u4pt1j3i2xnyy	8	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00404pt1nseovfdu	9	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r00464pt1m94fh8ot	10	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004c4pt1mzykrnj9	11	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
cmhatn36r004i4pt1e1gn6fxo	12	cmhatn36p002n4pt1xqdil8q9	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
\.


--
-- Data for Name: BudgetYear; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."BudgetYear" (id, year, "profileId", "createdAt", "updatedAt") FROM stdin;
cmhat6tx000044pt1yd6ufkhc	2025	cmh8fb9eu00014pz1jf4szsuk	2025-10-28 16:56:39.156	2025-10-28 16:56:39.156
cmhatn36p002n4pt1xqdil8q9	2025	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 17:09:17.665	2025-10-28 17:09:17.665
\.


--
-- Data for Name: DefaultBudgetCategory; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."DefaultBudgetCategory" (id, name, color, icon, "profileId", "createdAt", "updatedAt") FROM stdin;
cmhasxu5700404pb6ok0x4fap	Alimentation	#10b981	🍔	cmh8fb9eu00014pz1jf4szsuk	2025-10-28 16:49:39.547	2025-10-28 16:49:39.547
cmhasxu5700414pb65olfy0p8	Santé	#ef4444	💊	cmh8fb9eu00014pz1jf4szsuk	2025-10-28 16:49:39.547	2025-10-28 16:49:39.547
cmhasxu5700424pb63gvjace3	Loisir	#a855f7	🎮	cmh8fb9eu00014pz1jf4szsuk	2025-10-28 16:49:39.547	2025-10-28 16:49:39.547
cmhasxu5700434pb6t6o0wx36	Achats	#f59e0b	🛍️	cmh8fb9eu00014pz1jf4szsuk	2025-10-28 16:49:39.547	2025-10-28 16:49:39.547
cmhasxu5700444pb6as88ijov	Factures/Loyer	#3b82f6	🏠	cmh8fb9eu00014pz1jf4szsuk	2025-10-28 16:49:39.547	2025-10-28 16:49:39.547
cmhasxu5b00454pb6a1qqvga6	Alimentation	#10b981	🍔	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 16:49:39.552	2025-10-28 16:49:39.552
cmhasxu5b00464pb6y32tmy3d	Santé	#ef4444	💊	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 16:49:39.552	2025-10-28 16:49:39.552
cmhasxu5b00474pb6koeceac4	Loisir	#a855f7	🎮	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 16:49:39.552	2025-10-28 16:49:39.552
cmhasxu5b00484pb6fcllpx2k	Achats	#f59e0b	🛍️	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 16:49:39.552	2025-10-28 16:49:39.552
cmhasxu5b00494pb6ymkymf9c	Factures/Loyer	#3b82f6	🏠	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 16:49:39.552	2025-10-28 16:49:39.552
cmhax9hyr00884pt1z0a4vnsv	Abonnements 	#ff6a00	🗓	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 18:50:42.075	2025-10-28 18:50:42.075
\.


--
-- Data for Name: GardeAnimaux; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."GardeAnimaux" (id, "typeAnimal", "nomAnimal", "nomClient", contact, "dateDebut", "dateFin", tarif, "typeGarde", statut, notes, photos, "profileId", "createdAt", "updatedAt", "isShared", source, duree) FROM stdin;
cmh8xvzrl000l4ph4gu570r82	Chien	Hazoo	Quentin	Rover:‪0662131626‬	2025-10-28 00:00:00	2025-10-31 00:00:00	71	Garde chez moi	terminé	Trop attachant, mignon, hyper active et bruyant	{/uploads/pets/1761960431345-0kgehx-IMG_6145.jpeg,/uploads/pets/1761960431351-5l3bbb-IMG_6139.jpeg,/uploads/pets/1761960431358-mbwv4-IMG_6132.jpeg,/uploads/pets/1761960431362-mrae0f-IMG_6122.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 09:32:39.249	2025-11-01 09:22:57.123	t	Rover	3 jours
cmh8fb9ff000a4pz1ca84dbu9	Chien	Billy	Fiona Buon	07.45.67.89.01	2025-10-20 00:00:00	2025-11-07 00:00:00	100	Promenade	terminé	Anxieux en balade, peur des inconnus	{/uploads/pets/1761591452224-8yg3z-IMG_2190.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.907	2025-11-09 22:28:30.241	f	Facebook	10 visites
cmh8fh1ll00034p43bb213640	Chien	Groot	Jean	Rover	2025-10-25 00:00:00	2025-10-26 00:00:00	17	Garde chez moi	terminé	très gentil mais pue	{/uploads/pets/1761526618157-o4a4thm-grout.jpg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:57:08.697	2025-10-28 15:03:03.169	t	Rover	1 jour
cmh8fb9fo000g4pz1bzscmtpf	Chien	Yolie	Lisa	07.82.91.22.20	2025-08-10 00:00:00	2025-08-12 00:00:00	50	Garde chez moi	terminé	Hyperactive +++	{/uploads/pets/1761559927059-8uuc7t-IMG_0278.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.917	2025-10-28 15:03:33.971	t	Animaute	3 jours
cmh8fb9fl000e4pz1d2p81ios	Chien	Sanji	Rémi 	06.74.15.78.10 	2025-05-24 00:00:00	2025-05-25 00:00:00	40	Garde chez moi	terminé		{/uploads/pets/1761542078626-mue3qd-IMG_8032.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.913	2025-10-28 05:09:38.058	f	Animaute	2 jours
cmh8fb9fc00084pz1uiqp7vnj	Chat	Moki	Edwige 	06.34.56.78.90:‪0658730338‬	2025-10-11 00:00:00	2025-10-14 00:00:00	62	Visite à domicile	terminé		{/uploads/pets/1761591286666-ub9o7l-IMG_2040.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.905	2025-10-28 05:09:53.794	f	Rover	8 visites
cmhaqlutq002z4p2wtvjoqmbi	Chien	Akamaru	Ambre	\N	2025-11-08 00:00:00	2025-11-11 00:00:00	56	Garde chez moi	terminé		{/uploads/pets/1762607283126-r1k0z-IMG_2574.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-28 15:44:21.325	2025-11-14 16:37:00.697	t	Rover	3 nuits
cmiyizdr7019d4pqqihhungyx	Chien	Chouquette	Céline	\N	2025-12-11 00:00:00	2025-12-15 00:00:00	70	Garde chez moi	en_cours		{}	cmh8fb9ez00024pz1p3qi2dyr	2025-12-09 11:57:06.019	2025-12-11 13:33:27.858	t	Rover	4 jours
cmhc624wj000l4p4yymxd805p	Chat	Moki	Edwige	\N	2025-11-01 00:00:00	2025-11-02 00:00:00	24	Visite à domicile	terminé		{/uploads/pets/1761752700314-lan9lg-IMG_2040.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-29 15:44:41.298	2025-11-04 09:57:39.417	f	Rover	3 visites 
cmhd33yhv001p4p4yt5wwfe9a	Chien	Vi	Marius	\N	2025-11-01 00:00:00	2025-11-04 00:00:00	59.5	Garde chez moi	terminé		{/uploads/pets/1762009623730-28jcg-IMG_2393.jpeg,/uploads/pets/1762010823080-occdaa-IMG_6158.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-30 07:09:53.635	2025-11-05 12:07:02.948	t	Rover	4 jours
cmh8fb9f700044pz1db7ii944	Chat	Micha	Anna	06.12.34.56.78:0619842898	2025-10-04 00:00:00	2025-10-04 00:00:00	8	Visite à domicile	terminé		{}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.899	2025-10-28 11:53:55.196	f	Facebook	1 visite
cmj1hbzvc01bj4pqqo0tiwvdb	Chat	Moki	Edwidge	\N	2025-12-11 00:00:00	2025-12-12 00:00:00	16	Visite à domicile	en_cours		{}	cmh8fb9ez00024pz1p3qi2dyr	2025-12-11 13:34:13.847	2025-12-11 13:34:36.957	f		2 visites
cmh8fb9fr000i4pz1iqznliyf	Chien	Rose	Marie Anais	0:marieanais.mr	2025-09-18 00:00:00	2025-09-18 00:00:00	15	Garde chez moi	terminé	Calme ++ peureuse	{/uploads/pets/1761590825863-7yieg3-007b44b9-47ff-422e-b607-fad10b87050e.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.919	2025-10-28 05:11:07.499	t	Animaute	1 jours
cmh8fb9fa00064pz10ssgpnt2	Chien	Mambo	Lucile Sbeghen	07.23.45.67.89	2025-10-10 00:00:00	2025-10-12 00:00:00	50	Garde chez moi	terminé	Aveugle	{/uploads/pets/1761591131291-dbimgp-IMG_2008.jpeg}	cmh8fb9ez00024pz1p3qi2dyr	2025-10-27 00:52:38.902	2025-10-28 13:08:58.196	t	Facebook	3 jours
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."Profile" (id, name, avatar, "createdAt", "updatedAt") FROM stdin;
cmh8fb9eu00014pz1jf4szsuk	jordan	\N	2025-10-27 00:52:38.886	2025-10-27 00:52:38.886
cmh8fb9ez00024pz1p3qi2dyr	juliette	\N	2025-10-27 00:52:38.891	2025-10-27 00:52:38.891
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."PushSubscription" (id, endpoint, p256dh, auth, "profileId", "userAgent", "createdAt", "updatedAt") FROM stdin;
cmhj5whzv000b4pdjua9e3gd1	https://web.push.apple.com/QBPVOZRo3y5NpTPefL4xj6HaeVgxnzYIM-9lvYEVWffBpvQLUE8xnu6l7zTwhRsO7HC2Sck1g53BuJOAYyFEOVjxMvZvw1kiYjrCxUcsCgUkdfLUOH79VT6bJPmAZkgTLbLNKqcAkOglDQ0oWLLiR6FOeArJ3tJIh7xWmBTJcSw	BDU1guKM1zwLNaPFCwV5oo7FaS0I-GeKPgnvYPZw30poAG8X2X7z-cIYU8gTCiSSOuN0so0DL8RFqm-tGc8XBQk	thC8WnKdaT-zYSWMLYvKRg	cmh8fb9eu00014pz1jf4szsuk	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1	2025-11-03 13:14:41.564	2025-11-03 13:14:41.564
cmhjrlj1e00024pj9t6ncu223	https://web.push.apple.com/QHWaeq7y3d55SC7aHpZnUEKj2FgGAztEguyXj2QEppzvrMqlpBcuEvoVgkE775GPxGJWDQ1_TWqrRhUzhwZdZ8kCQldi4Vwz_TyC8QprT1PyyeAGmeyHNFlWlICgwWT-T1W9GjBzW3OnBDduccdibJsOVDlNmfjId5JS9QLPvcs	BNmZSAXl5S1j6M4_nHhSF3DNpFrrER-vx53hFQvYUad9QRuabwEbZt_Vz1K4NsjQm1v7kEtaHL3hLkJOxKxGids	_zPPYhCPqUVRrdYNK0wxwQ	cmh8fb9ez00024pz1p3qi2dyr	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	2025-11-03 23:22:01.25	2025-11-03 23:22:01.25
\.


--
-- Data for Name: Recette; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."Recette" (id, titre, description, ingredients, etapes, "tempsPrep", "tempsCuisson", portions, categorie, image, favorite, "profileId", "createdAt", "updatedAt") FROM stdin;
cmh8fb9fu000k4pz1qj9pdtfr	Pâtes Carbonara	Recette traditionnelle italienne	["Pâtes","Lardons","Œufs","Parmesan","Poivre"]	["Cuire les pâtes","Faire revenir les lardons","Mélanger œufs et parmesan","Mélanger le tout hors du feu"]	10	15	4	Plat principal	\N	t	cmh8fb9eu00014pz1jf4szsuk	2025-10-27 00:52:38.922	2025-10-27 00:52:38.922
cmh8fb9fx000m4pz19cicrynh	Salade César	Salade fraîche et gourmande	["Salade romaine","Poulet","Croûtons","Parmesan","Sauce césar"]	["Laver et couper la salade","Griller le poulet","Préparer les croûtons","Mélanger avec la sauce"]	15	10	2	Entrée	\N	f	cmh8fb9eu00014pz1jf4szsuk	2025-10-27 00:52:38.926	2025-10-27 00:52:38.926
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: jjcore_user
--

COPY public."User" (id, email, password, "createdAt", "updatedAt") FROM stdin;
cmh8fb9en00004pz11qsjol7t	jj@platform.com	$2b$10$MgBNRDRlTppDSTud3POsSe3qLsYzf/sZ4X5c0Wv.7PjlQS44auDMW	2025-10-27 00:52:38.88	2025-10-27 00:52:38.88
\.


--
-- Name: Abonnement Abonnement_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."Abonnement"
    ADD CONSTRAINT "Abonnement_pkey" PRIMARY KEY (id);


--
-- Name: BudgetCategory BudgetCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetCategory"
    ADD CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY (id);


--
-- Name: BudgetExpense BudgetExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetExpense"
    ADD CONSTRAINT "BudgetExpense_pkey" PRIMARY KEY (id);


--
-- Name: BudgetIncome BudgetIncome_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetIncome"
    ADD CONSTRAINT "BudgetIncome_pkey" PRIMARY KEY (id);


--
-- Name: BudgetMonth BudgetMonth_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetMonth"
    ADD CONSTRAINT "BudgetMonth_pkey" PRIMARY KEY (id);


--
-- Name: BudgetYear BudgetYear_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetYear"
    ADD CONSTRAINT "BudgetYear_pkey" PRIMARY KEY (id);


--
-- Name: DefaultBudgetCategory DefaultBudgetCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."DefaultBudgetCategory"
    ADD CONSTRAINT "DefaultBudgetCategory_pkey" PRIMARY KEY (id);


--
-- Name: GardeAnimaux GardeAnimaux_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."GardeAnimaux"
    ADD CONSTRAINT "GardeAnimaux_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: Recette Recette_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."Recette"
    ADD CONSTRAINT "Recette_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Abonnement_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "Abonnement_profileId_idx" ON public."Abonnement" USING btree ("profileId");


--
-- Name: BudgetCategory_monthId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetCategory_monthId_idx" ON public."BudgetCategory" USING btree ("monthId");


--
-- Name: BudgetExpense_categoryId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetExpense_categoryId_idx" ON public."BudgetExpense" USING btree ("categoryId");


--
-- Name: BudgetExpense_date_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetExpense_date_idx" ON public."BudgetExpense" USING btree (date);


--
-- Name: BudgetExpense_monthId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetExpense_monthId_idx" ON public."BudgetExpense" USING btree ("monthId");


--
-- Name: BudgetExpense_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetExpense_profileId_idx" ON public."BudgetExpense" USING btree ("profileId");


--
-- Name: BudgetIncome_date_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetIncome_date_idx" ON public."BudgetIncome" USING btree (date);


--
-- Name: BudgetIncome_monthId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetIncome_monthId_idx" ON public."BudgetIncome" USING btree ("monthId");


--
-- Name: BudgetIncome_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetIncome_profileId_idx" ON public."BudgetIncome" USING btree ("profileId");


--
-- Name: BudgetMonth_month_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetMonth_month_idx" ON public."BudgetMonth" USING btree (month);


--
-- Name: BudgetMonth_yearId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetMonth_yearId_idx" ON public."BudgetMonth" USING btree ("yearId");


--
-- Name: BudgetMonth_yearId_month_key; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE UNIQUE INDEX "BudgetMonth_yearId_month_key" ON public."BudgetMonth" USING btree ("yearId", month);


--
-- Name: BudgetYear_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetYear_profileId_idx" ON public."BudgetYear" USING btree ("profileId");


--
-- Name: BudgetYear_year_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "BudgetYear_year_idx" ON public."BudgetYear" USING btree (year);


--
-- Name: BudgetYear_year_profileId_key; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE UNIQUE INDEX "BudgetYear_year_profileId_key" ON public."BudgetYear" USING btree (year, "profileId");


--
-- Name: DefaultBudgetCategory_name_profileId_key; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE UNIQUE INDEX "DefaultBudgetCategory_name_profileId_key" ON public."DefaultBudgetCategory" USING btree (name, "profileId");


--
-- Name: DefaultBudgetCategory_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "DefaultBudgetCategory_profileId_idx" ON public."DefaultBudgetCategory" USING btree ("profileId");


--
-- Name: GardeAnimaux_dateDebut_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "GardeAnimaux_dateDebut_idx" ON public."GardeAnimaux" USING btree ("dateDebut");


--
-- Name: GardeAnimaux_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "GardeAnimaux_profileId_idx" ON public."GardeAnimaux" USING btree ("profileId");


--
-- Name: Profile_name_key; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE UNIQUE INDEX "Profile_name_key" ON public."Profile" USING btree (name);


--
-- Name: PushSubscription_endpoint_key; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON public."PushSubscription" USING btree (endpoint);


--
-- Name: PushSubscription_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "PushSubscription_profileId_idx" ON public."PushSubscription" USING btree ("profileId");


--
-- Name: Recette_profileId_idx; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE INDEX "Recette_profileId_idx" ON public."Recette" USING btree ("profileId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: jjcore_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Abonnement Abonnement_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."Abonnement"
    ADD CONSTRAINT "Abonnement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BudgetCategory BudgetCategory_monthId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetCategory"
    ADD CONSTRAINT "BudgetCategory_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES public."BudgetMonth"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BudgetExpense BudgetExpense_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetExpense"
    ADD CONSTRAINT "BudgetExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."BudgetCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BudgetExpense BudgetExpense_monthId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetExpense"
    ADD CONSTRAINT "BudgetExpense_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES public."BudgetMonth"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BudgetIncome BudgetIncome_monthId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetIncome"
    ADD CONSTRAINT "BudgetIncome_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES public."BudgetMonth"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BudgetMonth BudgetMonth_yearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."BudgetMonth"
    ADD CONSTRAINT "BudgetMonth_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES public."BudgetYear"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GardeAnimaux GardeAnimaux_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."GardeAnimaux"
    ADD CONSTRAINT "GardeAnimaux_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Recette Recette_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jjcore_user
--

ALTER TABLE ONLY public."Recette"
    ADD CONSTRAINT "Recette_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO jjcore_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO jjcore_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO jjcore_user;


--
-- PostgreSQL database dump complete
--

\unrestrict gpckEUEZ5kbFIPzmquH8321ngsXRB1zKONdo8LhBRzNz8E3Q107xIHaeSeFAgL6

