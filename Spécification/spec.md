# Spécification fonctionnelle

## Plateforme intelligente de gestion alimentaire

**Version :** 0.1 (Document de travail)

---

# 1. Présentation du projet

## 1.1 Contexte

La gestion quotidienne de l'alimentation implique de nombreuses tâches répétitives et chronophages :

* vérifier les produits encore disponibles à domicile ;
* réfléchir aux repas à préparer ;
* déterminer les ingrédients manquants ;
* rédiger une liste de courses ;
* effectuer les achats ;
* gérer les dates de péremption ;
* suivre son alimentation.

Ces actions nécessitent une charge mentale importante alors qu'elles pourraient être largement automatisées.

L'objectif de ce projet est de concevoir une plateforme capable de centraliser toutes les informations relatives au stock alimentaire, aux recettes, à la planification des repas et aux achats afin d'assister l'utilisateur au quotidien.

L'application devra progressivement devenir un véritable assistant personnel capable de proposer des repas, d'anticiper les courses, de limiter le gaspillage alimentaire et d'accompagner l'utilisateur dans ses objectifs nutritionnels.

L'objectif n'est pas de développer une application de gestion de stock alimentaire, mais de concevoir un assistant intelligent capable d'accompagner l'utilisateur dans l'ensemble de son organisation alimentaire quotidienne, en réduisant au maximum les tâches répétitives et la charge mentale associée.
---

## 1.2 Vision du produit

La philosophie de l'application repose sur un principe simple :

> **Réduire au maximum le nombre de décisions que l'utilisateur doit prendre concernant son alimentation quotidienne tout en lui laissant la possibilité de reprendre le contrôle à tout moment.**

L'application ne doit pas être un simple gestionnaire de stock.

Elle doit devenir un assistant intelligent capable :

* d'analyser le contenu réel du domicile ;
* d'anticiper les besoins futurs ;
* de suggérer les repas les plus adaptés ;
* de générer automatiquement les listes de courses ;
* d'accompagner l'utilisateur dans son alimentation.

Toutes les fonctionnalités devront être pensées dans cette optique.

---

## 1.3 Objectifs fonctionnels

Le produit devra permettre de :

* gérer précisément le stock alimentaire ;
* connaître à tout moment les produits disponibles ;
* gérer plusieurs zones de stockage (frigo, congélateur, placards, cave, etc.) ;
* construire des recettes personnalisées ;
* planifier les repas sur plusieurs semaines ;
* générer automatiquement les listes de courses ;
* assurer le suivi nutritionnel des repas ;
* limiter le gaspillage alimentaire ;
* proposer automatiquement des idées de repas adaptées au contexte ;
* conserver un historique complet des actions réalisées.

---

## 1.4 Objectifs utilisateurs

L'utilisateur ne doit plus avoir besoin de :

* chercher les produits présents chez lui avant de faire les courses ;
* réfléchir quotidiennement aux repas à préparer ;
* recalculer les quantités nécessaires pour cuisiner ;
* écrire manuellement sa liste de courses ;
* mémoriser les dates de péremption.

L'application doit fournir toutes ces informations de manière proactive.

---

## 1.5 Principes de conception

Les principes suivants devront guider l'ensemble des développements :

### Automatisation

Toute action pouvant être automatisée devra l'être.

L'utilisateur ne doit intervenir que lorsque cela apporte une réelle valeur.

### Simplicité

Chaque écran devra permettre d'accomplir une tâche rapidement.

Le nombre de manipulations devra être limité.

### Fiabilité

Le stock devra refléter au mieux la réalité.

Toutes les mises à jour devront être traçables.

### Personnalisation

L'utilisateur devra pouvoir adapter l'application à son mode de vie :

* personnalisation des repas ;
* personnalisation des emplacements ;
* personnalisation des notifications ;
* personnalisation des objectifs alimentaires.

### Évolutivité

Le modèle de données devra permettre l'ajout futur de nouvelles fonctionnalités sans remise en cause de l'architecture existante.

---

# 2. Périmètre fonctionnel

La plateforme est organisée autour de plusieurs domaines fonctionnels.

## Gestion du catalogue produit

Le système devra être capable de gérer un catalogue de produits alimentaires comprenant les informations nutritionnelles, les caractéristiques des produits et leurs différentes références commerciales.

Le catalogue constitue la base de connaissance de l'application.

---

## Gestion du stock

Le système devra permettre de connaître à tout moment le contenu exact du foyer.

Chaque produit présent devra être identifié individuellement avec notamment :

* sa quantité ;
* son unité ;
* son emplacement ;
* sa date d'ajout ;
* sa date limite de consommation lorsqu'elle est connue ;
* son historique.

---

## Gestion des recettes

L'utilisateur pourra créer des recettes entièrement personnalisées.

Chaque recette sera composée :

* d'ingrédients ;
* d'étapes ;
* d'informations nutritionnelles calculées automatiquement ;
* d'informations de préparation ;
* de tags permettant leur classification.

---

## Planification alimentaire

L'utilisateur pourra organiser ses repas sur une vue hebdomadaire.

Le planning servira de base au calcul automatique des besoins alimentaires.

Les repas devront rester entièrement personnalisables.

---

## Génération automatique des courses

À partir :

* du stock actuel ;
* des recettes planifiées ;
* des stocks minimums configurés ;
* des préférences de l'utilisateur ;

l'application devra générer automatiquement une liste de courses optimisée.

Cette liste restera modifiable manuellement.

---

## Suivi nutritionnel

L'application devra calculer automatiquement :

* les calories ;
* les macronutriments ;
* les micronutriments disponibles lorsque les données existent.

Ces informations seront disponibles aussi bien au niveau d'une recette que d'un repas, d'une journée ou d'une période.

---

## Assistant intelligent

L'application intégrera un moteur de recommandation capable de proposer automatiquement des repas adaptés en tenant compte notamment :

* des habitudes de l'utilisateur ;
* des produits à consommer rapidement ;
* des objectifs nutritionnels ;
* du contenu actuel du stock ;
* des préférences alimentaires ;
* de la diversité des repas récents.

L'objectif est d'assister l'utilisateur dans ses choix sans jamais les imposer.

---

# 3. Contraintes techniques

Le projet devra être conçu selon une architecture moderne, modulaire et facilement déployable.

Les choix technologiques privilégiés sont les suivants :

* Frontend : Angular
* Backend : AdonisJS
* Base de données : PostgreSQL
* Conteneurisation : Docker
* Hébergement : VPS Ubuntu

L'application devra être développée en priorité sous forme de Progressive Web App (PWA), avec une approche **Mobile First**.

L'ergonomie devra être pensée avant tout pour une utilisation sur smartphone, notamment lors des courses, en cuisine ou pendant la préparation des repas.

Le fonctionnement sur ordinateur constituera un complément destiné principalement aux tâches de gestion avancée (création de recettes, administration, consultation des statistiques, etc.).

Le choix des technologies reste une préférence du porteur de projet. L'équipe technique pourra proposer des ajustements si ceux-ci apportent une amélioration significative tout en respectant les objectifs fonctionnels définis dans cette spécification.


# 4. Concepts métier

Cette section définit les entités centrales du système ainsi que leurs relations. Ces concepts constituent la base du modèle de données et de la logique fonctionnelle de l’application.

---

## 4.1 Foyer

Le foyer représente l’unité principale de gestion du système.

Il correspond à un ensemble d’utilisateurs partageant un même stock alimentaire.

### Rôle

* Centraliser le stock alimentaire
* Partager les recettes, le planning et les courses entre plusieurs utilisateurs
* Permettre une gestion multi-utilisateur (colocation, couple, famille)

### Propriétés principales

* nom du foyer
* liste des utilisateurs membres
* paramètres globaux (unités, langue, etc.)
* règles de partage des données

### Remarques

Un utilisateur peut appartenir à un ou plusieurs foyers, mais un foyer est toujours indépendant des autres.

---

## 4.2 Utilisateur

L’utilisateur est une personne interagissant avec la plateforme.

### Rôle

* Consulter et modifier le stock
* Créer des recettes
* Planifier des repas
* Effectuer des courses
* Recevoir des recommandations et notifications

### Propriétés principales

* identité (nom, email)
* préférences alimentaires
* objectifs nutritionnels (optionnel)
* paramètres de notification
* rôle dans le foyer (admin, membre, lecture seule)

---

## 4.3 Produit (concept générique)

Le produit représente une catégorie alimentaire abstraite indépendante des marques.

Exemples :

* riz basmati
* lait
* œufs
* pâtes

### Rôle

* Servir de base commune aux recettes et au stock
* Uniformiser les ingrédients dans les recettes
* Permettre les substitutions et équivalences

### Propriétés principales

* nom
* catégorie alimentaire
* unité principale (grammes, litres, unité, etc.)
* informations nutritionnelles de base (optionnel)
* allergènes
* contraintes de conservation générales

---

## 4.4 Référence commerciale (produit réel)

La référence commerciale représente un produit concret acheté dans le commerce.

Exemples :

* Riz basmati 1kg marque X
* Lait demi-écrémé 1L marque Y

### Rôle

* Permettre la gestion réelle du stock
* Associer les données nutritionnelles précises
* Gérer les codes-barres et la reconnaissance produit

### Propriétés principales

* code-barres (EAN)
* marque
* nom commercial
* poids / volume
* valeurs nutritionnelles détaillées
* conditions de conservation
* durée de conservation
* image du produit
* prix indicatif (optionnel)

---

## 4.5 Stock

Le stock représente l’ensemble des produits réellement disponibles dans le foyer.

### Rôle

* Représenter la réalité physique du domicile
* Permettre le suivi des quantités disponibles
* Servir de base aux calculs de planning et de courses

### Propriétés principales

Chaque entrée de stock est une instance indépendante :

* référence commerciale associée
* quantité
* unité
* date d’ajout
* date de péremption (si applicable)
* emplacement de stockage
* statut (disponible, réservé, consommé, jeté)

### Remarque importante

Le stock est géré en “unités physiques” et non en agrégats, afin de permettre :

* la gestion des dates de péremption individuelles
* l’application de règles FIFO
* la traçabilité complète

---

## 4.6 Emplacement

L’emplacement représente une zone physique de stockage dans le foyer.

Exemples :

* frigo
* congélateur
* placard
* cave

### Rôle

* Localiser les produits dans le foyer
* Faciliter l’organisation du stock
* Optimiser les parcours utilisateur en cuisine

### Propriétés principales

* nom
* type (froid, sec, congélation, autre)
* description optionnelle

---

## 4.7 Recette

La recette représente une préparation culinaire composée d’ingrédients et d’étapes.

### Rôle

* Permettre la planification des repas
* Générer automatiquement les besoins en stock
* Fournir une base de recommandations alimentaires

### Propriétés principales

* nom
* liste d’ingrédients
* quantités par ingrédient
* nombre de portions
* étapes de préparation
* temps de préparation
* tags (végétarien, rapide, économique, etc.)
* informations nutritionnelles calculées

---

## 4.8 Ingrédient de recette

Représente la relation entre une recette et un produit.

### Rôle

* Définir les quantités nécessaires
* Permettre les substitutions éventuelles
* Servir de base au calcul du stock nécessaire

### Propriétés principales

* produit générique
* quantité
* unité
* caractère optionnel (oui/non)
* substituts possibles (optionnel)

---

## 4.9 Planning de repas

Le planning représente l’organisation des repas dans le temps.

### Rôle

* Planifier les repas futurs
* Déclencher la génération de liste de courses
* Servir de base au moteur de recommandation

### Structure

* organisation par jour
* liste de repas par jour
* repas personnalisables (nombre non limité)

---

## 4.10 Repas planifié

Représente un repas à une date donnée.

### Rôle

* Lier une ou plusieurs recettes à un moment précis
* Servir de base à la consommation de stock
* Permettre le suivi nutritionnel

### Propriétés principales

* date
* type (petit déjeuner, déjeuner, dîner, etc.)
* liste de recettes associées
* statut (planifié, réalisé, annulé, modifié)

---

## 4.11 Liste de courses

La liste de courses représente les besoins d’achat générés par le système.

### Rôle

* Consolider les besoins issus du planning et du stock minimum
* Optimiser les achats
* Faciliter les courses en magasin

### Propriétés principales

* liste d’articles
* quantités à acheter
* état (en cours, validée, achetée)
* date de création

---

## 4.12 Historique

L’historique trace toutes les actions effectuées dans le système.

### Rôle

* Assurer la traçabilité complète
* Permettre des analyses statistiques
* Faciliter le debug et la correction d’erreurs

### Événements suivis

* ajout / suppression de stock
* consommation d’aliments
* modification de recette
* planification de repas
* génération de courses

---

## 4.13 Notification

Les notifications représentent les interactions proactives de l’application avec l’utilisateur.

### Rôle

* Rappeler les repas planifiés
* Alerter sur les dates de péremption
* Demander validation de consommation
* Proposer des actions intelligentes

### Types

* notifications de repas
* notifications de stock faible
* notifications de péremption
* suggestions de repas

# 5. Règles métier

Cette section définit l’ensemble des règles de gestion applicables au système. Elles constituent la référence fonctionnelle pour l’implémentation de la logique applicative.

---

## 5.1 Principe général de gestion du stock

Le stock représente la réalité physique des produits présents dans le foyer.

### Règle fondamentale

> Le stock n’est jamais modifié automatiquement par une planification.

Toute modification du stock doit être déclenchée par un événement explicite :

* validation de consommation
* achat validé
* ajout manuel
* suppression ou correction utilisateur
* perte / gaspillage déclaré

---

## 5.2 Déclenchement de la consommation de stock

La consommation des produits est liée aux repas réalisés.

### Règle principale

Un repas planifié **ne consomme jamais de stock tant qu’il n’est pas validé comme réalisé**.

### Processus de validation

1. L’heure prévue du repas est atteinte
2. Une notification est envoyée à l’utilisateur (si activée)
3. L’utilisateur choisit une action :

   * valider la réalisation
   * reporter le repas
   * annuler le repas
   * modifier le repas

### Cas de validation

Si le repas est validé comme réalisé :

* le stock est décrémenté selon les ingrédients de la recette
* l’historique est mis à jour
* les valeurs nutritionnelles sont calculées

---

## 5.3 Gestion des quantités réellement consommées

Lors de la validation d’un repas, l’utilisateur peut ajuster les quantités consommées.

### Règle

> Les quantités théoriques d’une recette sont proposées par défaut, mais peuvent être modifiées avant validation.

### Exemple

Recette :

* 250g de pâtes

Consommation réelle :

* 300g de pâtes

Le stock est ajusté sur la base des valeurs corrigées.

---

## 5.4 Gestion des produits manquants

Lors de la validation d’un repas, il est possible que certains ingrédients soient insuffisants.

### Règle

Si un ou plusieurs ingrédients sont manquants :

* l’utilisateur est informé
* il peut choisir de :

  * continuer avec substitution
  * modifier la recette
  * annuler la consommation

---

## 5.5 Principe FIFO (First In First Out)

Le stock est consommé selon l’ordre d’entrée des produits.

### Règle

> Les produits les plus anciens (date d’entrée ou DLC la plus proche) sont consommés en priorité.

### Objectif

* limiter le gaspillage
* respecter les dates de péremption

---

## 5.6 Gestion des unités et conversions

Le système doit gérer plusieurs unités de mesure.

### Règle

Toutes les unités doivent être convertibles lorsque cela est possible.

Exemples :

* kg ↔ g
* l ↔ ml

### Cas non convertibles

* unités (œufs, boîtes, pièces)
* unités commerciales (paquet, bouteille)

Dans ce cas, la consommation se fait par unité entière ou fraction définie par le produit.

---

## 5.7 Gestion des recettes et du stock

### Règle fondamentale

Une recette n’a aucun impact sur le stock tant qu’elle n’est pas exécutée.

Une recette est donc :

* un modèle
* non destructif
* réutilisable

---

## 5.8 Substitutions d’ingrédients

### Règle

Un ingrédient peut avoir des substituts définis.

Lors de la validation d’un repas :

* si un ingrédient est absent
* et qu’un substitut est disponible

alors le système peut proposer automatiquement une alternative.

### Exemple

* mozzarella → emmental

La substitution doit être validée par l’utilisateur.

---

## 5.9 Gestion des recettes optionnelles

### Règle

Un ingrédient peut être :

* obligatoire
* optionnel

Les ingrédients optionnels :

* n’empêchent pas la réalisation de la recette
* ne sont consommés que s’ils sont présents

---

## 5.10 Gestion des portions

### Règle

Chaque recette est définie pour un nombre de portions de référence.

Lors de la planification :

* les quantités sont automatiquement ajustées en fonction du nombre de portions souhaité

### Exemple

Recette base : 4 portions

Planification : 2 portions

→ toutes les quantités sont divisées par 2

---

## 5.11 Gestion des repas planifiés

### Règle

Un repas peut contenir :

* une ou plusieurs recettes
* un nombre libre de composants

Un repas n’est pas une recette unique.

---

## 5.12 Modification des repas

### Règle

Un repas planifié peut être modifié à tout moment :

* avant réalisation
* après réalisation (avec correction du stock)

Toute modification doit être tracée dans l’historique.

---

## 5.13 Gestion de la liste de courses

### Règle fondamentale

La liste de courses est le résultat de 3 sources :

1. recettes planifiées
2. stock insuffisant
3. seuils minimums définis par l’utilisateur

---

## 5.14 Agrégation des besoins

Lors de la génération de la liste de courses :

* les besoins identiques sont fusionnés
* les unités sont converties si possible
* les conditionnements sont pris en compte

---

## 5.15 Gestion des conditionnements

### Règle

Les achats se font selon des unités commerciales réelles.

Exemple :

Besoin : 300g de pâtes

Conditionnement :

* paquet 500g

Résultat :

* 1 paquet de 500g

---

## 5.16 Produits minimums (réapprovisionnement automatique)

### Règle

L’utilisateur peut définir des seuils minimums par produit.

Si le stock descend sous ce seuil :

* le produit est ajouté automatiquement à la liste de courses

---

## 5.17 Gestion des pertes et gaspillage

### Règle

L’utilisateur peut déclarer :

* produit jeté
* produit perdu
* produit donné

Ces actions :

* modifient le stock
* sont tracées dans l’historique
* peuvent impacter les statistiques

---

## 5.18 Gestion des incohérences de stock

### Règle

Le stock peut être corrigé manuellement à tout moment.

En cas de divergence :

* l’historique permet de reconstituer la vérité
* la correction est prioritaire sur les estimations

---

## 5.19 Notifications et validation utilisateur

### Règle

Toute action critique sur le stock peut nécessiter une validation utilisateur :

* consommation
* correction
* substitution

Le mode automatique peut être activé par l’utilisateur.

---

## 5.20 Mode automatique

### Règle

L’utilisateur peut activer un mode automatique qui :

* valide automatiquement les consommations planifiées
* met à jour le stock sans confirmation
* réduit les notifications

Ce mode reste désactivable à tout moment.

# 6. Description fonctionnelle des modules

Cette section décrit le comportement attendu de chaque module fonctionnel de l’application. Chaque module s’appuie sur les concepts métier et les règles définies précédemment.

---

# 6.1 Module de gestion du stock

## Objectif

Permettre à l’utilisateur de connaître, modifier et corriger à tout moment l’état réel du stock alimentaire du foyer.

---

## Fonctionnalités principales

### Consultation du stock

L’utilisateur peut consulter :

* la liste des produits disponibles
* les quantités restantes
* les emplacements
* les dates de péremption
* les produits proches de la péremption

Filtrage possible par :

* produit
* emplacement
* date de péremption
* catégorie

---

### Ajout au stock

Un produit peut être ajouté via :

* scan de code-barres
* recherche dans le catalogue
* ajout manuel

Lors de l’ajout, l’utilisateur doit pouvoir définir :

* quantité
* unité
* emplacement
* date de péremption (si applicable)

---

### Modification du stock

L’utilisateur peut à tout moment :

* modifier une quantité
* changer un emplacement
* corriger une date de péremption
* fusionner ou séparer des lots

Toute modification est historisée.

---

### Suppression / consommation manuelle

L’utilisateur peut :

* déclarer un produit consommé
* déclarer un produit jeté
* déclarer un produit perdu

---

## Comportement spécifique

* Le stock est toujours affiché en temps réel
* Les entrées de stock sont indépendantes (gestion par lot)
* Les produits sont consommés selon la règle FIFO

---

# 6.2 Module catalogue produits

## Objectif

Fournir une base de données de produits alimentaires normalisés et réutilisables.

---

## Fonctionnalités principales

### Recherche produit

L’utilisateur peut rechercher :

* par nom
* par marque
* par code-barres
* par catégorie

---

### Création de produit

Si un produit n’existe pas :

* l’utilisateur peut le créer manuellement
* ou enrichir un produit existant

---

### Enrichissement des données

Un produit peut contenir :

* données nutritionnelles
* allergènes
* informations de conservation
* images
* conditionnements possibles

---

## Comportement

* Le catalogue est indépendant du stock
* Un produit peut exister sans être en stock
* Plusieurs références commerciales peuvent pointer vers un même produit générique

---

# 6.3 Module recettes

## Objectif

Permettre la création, la gestion et l’utilisation de recettes alimentaires.

---

## Fonctionnalités principales

### Création de recette

Une recette contient :

* nom
* ingrédients
* quantités
* étapes
* nombre de portions
* tags

---

### Ajout d’ingrédients

Chaque ingrédient peut être :

* obligatoire
* optionnel
* substituable

---

### Modification de recette

Une recette peut être modifiée à tout moment.

Les modifications :

* n’impactent pas les repas déjà planifiés
* sont historisées

---

### Consultation

Les recettes peuvent être filtrées par :

* tags
* difficulté
* temps de préparation
* disponibilité des ingrédients

---

## Comportement

* Les recettes sont indépendantes du stock
* Elles servent de base à la planification
* Elles permettent le calcul des besoins futurs

---

# 6.4 Module planning des repas

## Objectif

Permettre la planification des repas dans le temps.

---

## Fonctionnalités principales

### Vue hebdomadaire

L’utilisateur dispose d’une vue :

* par jour
* par repas
* modifiable librement

---

### Gestion des repas

Chaque jour peut contenir :

* petit-déjeuner
* déjeuner
* goûter
* dîner
* ou toute autre catégorie personnalisée

Chaque repas peut contenir :

* une ou plusieurs recettes

---

### Ajout / suppression

L’utilisateur peut :

* ajouter un repas
* supprimer un repas
* déplacer un repas
* dupliquer un repas

---

### Recommandation de repas

Le système peut proposer automatiquement :

* des recettes adaptées au stock
* des recettes adaptées aux objectifs nutritionnels
* des recettes à consommer rapidement

---

## Comportement

* Le planning est la base de la génération des courses
* Il n’a aucun impact direct sur le stock
* Il déclenche des notifications

---

# 6.5 Module liste de courses

## Objectif

Générer et gérer une liste de courses optimisée.

---

## Fonctionnalités principales

### Génération automatique

La liste est générée à partir de :

* planning des repas
* stock actuel
* seuils minimums
* règles de conditionnement

---

### Consultation

La liste affiche :

* produit à acheter
* quantité
* équivalent en unités commerciales
* catégorie (optionnel)

---

### Modification manuelle

L’utilisateur peut :

* ajouter un produit
* supprimer un produit
* modifier une quantité

---

### Validation des courses

Lors de l’achat :

* les produits sont ajoutés au stock
* la liste est mise à jour
* un historique est créé

---

## Comportement

* La liste est recalculable à tout moment
* Elle est fusionnée automatiquement en cas de doublons

---

# 6.6 Module notifications

## Objectif

Informer et solliciter l’utilisateur au bon moment.

---

## Types de notifications

* repas à valider
* produits proches péremption
* stock faible
* recommandations de repas
* rappels de courses

---

## Comportement

* les notifications peuvent être activées/désactivées
* elles peuvent être automatiques ou manuelles
* elles peuvent déclencher des actions rapides

---

# 6.7 Module moteur de recommandation

## Objectif

Proposer des repas intelligents adaptés au contexte utilisateur.

---

## Entrées du moteur

* stock actuel
* planning
* objectifs nutritionnels
* historique de consommation
* préférences utilisateur

---

## Sortie

Une liste de recettes classées par score.

---

## Critères de scoring

* disponibilité des ingrédients
* expiration proche des produits
* équilibre nutritionnel
* répétition des repas
* temps de préparation
* préférences utilisateur

---

## Comportement

* le moteur ne prend jamais de décision automatique
* il propose uniquement des suggestions
* l’utilisateur reste maître du choix

---

# 6.8 Module historique

## Objectif

Tracer toutes les actions réalisées dans l’application.

---

## Événements enregistrés

* ajout / suppression stock
* consommation
* planification
* modification recette
* génération courses
* achats

---

## Utilisation

* audit
* statistiques
* correction d’erreurs
* analyse comportementale


# 7. Cas limites et scénarios complexes

Cette section décrit les situations non nominales et les comportements attendus du système lorsqu’il est confronté à des incohérences, des erreurs ou des usages imprévus.

---

# 7.1 Consommation partielle d’un repas

## Scénario

Un repas planifié est validé, mais l’utilisateur ne consomme qu’une partie des ingrédients ou des portions prévues.

## Comportement attendu

* L’utilisateur peut ajuster manuellement les quantités réellement consommées
* Le stock est décrémenté uniquement sur la base des quantités validées
* Le repas est marqué comme “partiellement consommé” dans l’historique (optionnel)

---

# 7.2 Repas non réalisé

## Scénario

Un repas planifié n’est finalement pas préparé.

## Comportement attendu

L’utilisateur peut :

* annuler le repas (aucun impact sur le stock)
* le reporter à une autre date
* le supprimer du planning

Le système ne modifie jamais le stock dans ce cas.

---

# 7.3 Modification d’une recette déjà planifiée

## Scénario

Une recette est modifiée après avoir été utilisée dans un planning.

## Comportement attendu

* Les repas déjà planifiés conservent la version initiale de la recette
* Les nouvelles modifications s’appliquent uniquement aux futurs usages
* Une versioning implicite des recettes est maintenue

---

# 7.4 Modification d’un repas après validation

## Scénario

Un repas a été validé comme consommé, puis modifié après coup.

## Comportement attendu

* Le stock est recalculé en fonction des modifications
* Un événement de correction est ajouté à l’historique
* L’état précédent est conservé pour audit

---

# 7.5 Produit manquant lors de la préparation

## Scénario

Un ingrédient nécessaire à une recette est absent du stock.

## Comportement attendu

Le système propose :

* continuer avec substitution si disponible
* modifier la recette
* annuler la préparation
* ajuster les quantités

Le système ne bloque jamais totalement l’utilisateur.

---

# 7.6 Produit retrouvé dans le stock (correction tardive)

## Scénario

Un produit déclaré manquant est retrouvé après correction manuelle.

## Comportement attendu

* L’utilisateur peut réinjecter le produit dans le stock
* L’historique conserve la trace de l’erreur initiale
* Aucun recalcul automatique n’est effectué sur les événements passés

---

# 7.7 Produit périmé

## Scénario

Un produit atteint ou dépasse sa date de péremption.

## Comportement attendu

* Le produit est signalé comme périmé
* Il reste dans le stock mais est exclu des recommandations par défaut
* L’utilisateur peut :

  * le consommer quand même
  * le jeter
  * le marquer comme utilisé

---

# 7.8 Conflit multi-utilisateur

## Scénario

Deux utilisateurs modifient simultanément le même stock ou planning.

## Comportement attendu

* Le système applique une gestion de version (optimistic locking)
* En cas de conflit :

  * une fusion ou résolution manuelle est demandée
* Aucun écrasement silencieux n’est autorisé

---

# 7.9 Utilisation hors ligne

## Scénario

L’utilisateur utilise l’application sans connexion réseau.

## Comportement attendu

* Les actions sont enregistrées localement
* Les modifications sont synchronisées lors du retour en ligne
* En cas de conflit :

  * la version serveur est prioritaire
  * une résolution utilisateur peut être demandée

---

# 7.10 Scan de produit inconnu

## Scénario

Un code-barres n’existe pas dans la base de données.

## Comportement attendu

Le système propose :

* création d’un produit manuel
* recherche alternative
* import de données externes (si disponible)

---

# 7.11 Unités incohérentes

## Scénario

Une recette demande une unité incompatible avec le stock (ex : grammes vs unités).

## Comportement attendu

* tentative de conversion automatique si possible
* sinon suggestion de conditionnement équivalent
* sinon intervention utilisateur obligatoire

---

# 7.12 Conditionnement insuffisant

## Scénario

Le besoin calculé est inférieur à un conditionnement commercial.

Exemple :

* besoin : 300 g
* paquet minimum : 500 g

## Comportement attendu

* la quantité achetée correspond au conditionnement minimal
* le surplus est ajouté au stock
* ce surplus est pris en compte dans les futures planifications

---

# 7.13 Recette impossible à réaliser

## Scénario

Une recette ne peut pas être réalisée car trop d’ingrédients sont absents.

## Comportement attendu

Le moteur de recommandation peut :

* proposer des alternatives proches
* suggérer une autre recette compatible avec le stock
* proposer une modification de la recette

---

# 7.14 Erreur de saisie utilisateur

## Scénario

L’utilisateur saisit une quantité incohérente (ex : -5, 0, ou valeur absurde).

## Comportement attendu

* validation stricte côté application
* correction obligatoire avant sauvegarde
* suggestion de valeurs plausibles si possible

---

# 7.15 Historique incomplet ou corrompu

## Scénario

Une donnée historique est manquante ou incohérente.

## Comportement attendu

* le système privilégie le stock actuel comme source de vérité
* une alerte interne peut être générée
* aucune suppression automatique de données

---

# 7.16 Suppression d’un produit utilisé

## Scénario

Un produit est supprimé alors qu’il est utilisé dans des recettes ou du stock.

## Comportement attendu

* suppression logique interdite si dépendances actives
* sinon anonymisation du produit
* conservation des données historiques associées

---

# 7.17 Recette partagée entre foyers

## Scénario

Une recette est utilisée dans plusieurs foyers.

## Comportement attendu

* chaque foyer possède sa propre instance planifiée
* les modifications de recette n’impactent pas les autres foyers


# 8. Description fonctionnelle des parcours et écrans

> ⚠️ Note importante :
> Cette section décrit une proposition de structure fonctionnelle des écrans et parcours utilisateurs.
> Elle n’est pas figée. Toute amélioration, simplification ou optimisation proposée par l’équipe technique ou produit est non seulement autorisée mais encouragée, tant qu’elle respecte les règles métier définies dans ce document.

L’objectif de cette section est de fournir une base de compréhension des interactions utilisateur, sans contraindre les choix d’UX/UI final.

---

# 8.1 Principes généraux UX

L’application doit respecter les principes suivants :

* priorité absolue au mobile (PWA)
* accès rapide aux actions principales
* réduction du nombre d’écrans intermédiaires
* actions réalisables en 1 à 3 interactions maximum
* accessibilité en situation réelle (courses, cuisine, main occupée)

---

# 8.2 Structure globale de navigation

L’application est structurée autour de 5 grandes sections :

* Stock
* Planning
* Recettes
* Courses
* Profil / Paramètres

Une navigation rapide (type barre inférieure mobile) est recommandée.

---

# 8.3 Écran Stock (vue principale)

## Objectif

Donner une vision immédiate de ce qui est disponible dans le foyer.

## Contenu

* liste des produits du stock
* filtres (emplacement, catégorie, péremption)
* alertes (produits à consommer rapidement)
* recherche rapide

## Actions principales

* ajouter un produit
* scanner un produit
* modifier un produit
* déclarer consommation
* déplacer un produit
* supprimer / corriger

---

## Interaction clé

Chaque produit doit pouvoir être :

* ouvert en détail
* modifié rapidement
* consommé en 1 action rapide

---

# 8.4 Écran ajout de produit

## Objectif

Permettre l’ajout le plus rapide possible d’un produit au stock.

## Modes d’ajout

* scan code-barres (prioritaire)
* recherche catalogue
* ajout manuel

## Étapes fonctionnelles

1. sélection produit
2. choix quantité
3. choix unité / conditionnement
4. choix emplacement
5. saisie DLC (optionnel)
6. validation

---

# 8.5 Écran Planning

## Objectif

Visualiser et organiser les repas dans le temps.

## Vue principale

* semaine complète
* jours en colonnes ou scroll vertical
* repas par jour

## Actions

* ajouter un repas
* modifier un repas
* déplacer un repas
* supprimer un repas
* dupliquer un repas

---

## Interaction clé

Chaque repas doit permettre :

* ajout de recettes
* consultation du détail nutritionnel
* accès à la génération de courses associée

---

# 8.6 Écran création / modification de repas

## Contenu

* date
* type de repas
* liste de recettes
* portions ajustables

## Actions

* ajouter une recette
* supprimer une recette
* ajuster les quantités
* voir impact nutritionnel en temps réel
* voir impact sur le stock (simulation)

---

# 8.7 Écran Recettes

## Objectif

Gérer et consulter toutes les recettes.

## Contenu

* liste des recettes
* filtres (tags, temps, nutrition, disponibilité)
* recherche

## Actions

* créer recette
* modifier recette
* dupliquer recette
* planifier recette
* consulter faisabilité (selon stock)

---

# 8.8 Écran création de recette

## Structure

* nom
* portions
* ingrédients
* étapes
* tags

## Ajout d’ingrédients

* recherche produit
* quantité
* unité
* optionnel / obligatoire
* substituts

## Assistance

* calcul automatique nutritionnel
* estimation faisabilité selon stock
* suggestion d’ingrédients

---

# 8.9 Écran Courses

## Objectif

Permettre la gestion des achats de manière simple et rapide en magasin.

## Contenu

* liste consolidée des achats
* regroupement par catégorie
* indication des quantités et conditionnements

## Actions

* cocher un produit acheté
* ajouter un produit manuellement
* modifier quantité
* supprimer item

---

## Interaction clé

Lorsqu’un produit est coché :

* il est ajouté au stock
* il disparaît de la liste si totalement couvert

---

# 8.10 Écran scan produit

## Objectif

Ajouter un produit en moins de 5 secondes.

## Flux

* ouverture caméra
* scan code-barres
* identification produit
* proposition automatique de quantité et conditionnement
* validation rapide

---

# 8.11 Écran notifications / actions rapides

## Objectif

Centraliser les actions urgentes.

## Types de notifications

* repas à valider
* produits à consommer
* stock faible
* suggestions de repas

## Actions rapides

* valider repas
* reporter repas
* ajouter au stock
* ignorer

---

# 8.12 Écran recommandations

## Objectif

Aider l’utilisateur à décider quoi manger.

## Contenu

* liste de recettes classées par score
* explication du score (transparence)
* impact nutritionnel estimé
* impact stock estimé

## Actions

* planifier directement
* modifier recette
* remplacer recette

---

# 8.13 Écran profil / paramètres

## Contenu

* gestion utilisateur
* objectifs nutritionnels
* préférences alimentaires
* configuration foyer
* unités
* notifications
* mode automatique / manuel

---

# 8.14 Principes d’interaction globaux

* toute action doit pouvoir être annulée
* toute action critique doit être traçable
* les actions rapides doivent être privilégiées
* les données doivent toujours être accessibles en lecture même hors contexte
* les écrans doivent être optimisés pour usage une main


# 9. Principes directeurs de conception

Cette section définit les principes qui devront guider les choix fonctionnels et techniques tout au long du projet.

L'objectif n'est pas d'imposer une implémentation particulière, mais de garantir que toutes les décisions prises pendant la conception restent cohérentes avec la vision du produit.

---

## 9.1 Philosophie générale

L'application a pour vocation de devenir un véritable assistant personnel de gestion alimentaire.

Elle ne doit pas se limiter à stocker des données, mais accompagner activement l'utilisateur dans son quotidien en réduisant la charge mentale liée à l'organisation des repas, des courses et de la gestion du stock.

Chaque nouvelle fonctionnalité devra répondre à cette philosophie.

---

## 9.2 Priorité à l'automatisation

Chaque fois qu'une action peut être automatisée sans perte de contrôle pour l'utilisateur, cette automatisation devra être privilégiée.

L'utilisateur ne doit pas avoir à répéter des actions identiques lorsque le système est capable de les anticiper de manière fiable.

Cependant, toute automatisation devra pouvoir être désactivée ou contournée.

L'utilisateur reste toujours décisionnaire.

---

## 9.3 La donnée ne doit être saisie qu'une seule fois

Une information déjà connue du système ne doit jamais être demandée une seconde fois à l'utilisateur.

Le système devra privilégier :

* la réutilisation des données existantes ;
* le préremplissage des formulaires ;
* les suggestions intelligentes ;
* les calculs automatiques.

Ce principe devra guider la conception de l'ensemble des parcours utilisateurs.

---

## 9.4 Limiter la charge cognitive

L'application devra réduire le nombre de décisions que l'utilisateur doit prendre.

À titre d'exemple :

* proposer des repas plutôt que demander de les rechercher ;
* générer automatiquement les listes de courses ;
* rappeler les produits proches de leur péremption ;
* suggérer les quantités les plus pertinentes.

L'utilisateur doit passer davantage de temps à cuisiner qu'à utiliser l'application.

---

## 9.5 Transparence des décisions

Lorsqu'une recommandation ou une proposition est effectuée par le système, celui-ci devra être capable d'en expliquer les raisons.

Exemples :

* "Cette recette est proposée car tous les ingrédients sont déjà disponibles."
* "Ce produit est ajouté à la liste car le seuil minimum est atteint."
* "Cette recette est recommandée afin de consommer un produit proche de sa date de péremption."

Cette transparence favorisera la confiance de l'utilisateur envers le système.

---

## 9.6 Robustesse avant complexité

En cas de conflit entre une fonctionnalité complexe et la fiabilité générale du système, la robustesse devra toujours être privilégiée.

Un comportement simple mais fiable est préférable à une automatisation complexe difficile à comprendre ou à maintenir.

---

## 9.7 L'utilisateur garde toujours le contrôle

Aucune action irréversible ne devra être réalisée sans possibilité de correction.

L'utilisateur devra pouvoir :

* corriger le stock ;
* modifier un repas réalisé ;
* annuler une opération récente lorsque cela est possible ;
* désactiver les automatismes.

Le système assiste l'utilisateur sans jamais lui retirer la maîtrise de ses données.

---

## 9.8 Traçabilité

Toute modification ayant un impact sur le fonctionnement du système devra pouvoir être retrouvée dans un historique.

Cette traçabilité permettra :

* de comprendre l'origine d'une incohérence ;
* de faciliter les corrections ;
* d'alimenter les statistiques ;
* de renforcer la confiance dans les données.

---

## 9.9 Évolutivité

L'application est conçue pour évoluer dans le temps.

De nouvelles fonctionnalités pourront être ajoutées sans remettre en cause les concepts métier décrits dans cette spécification.

Parmi les évolutions envisagées figurent notamment :

* import automatique de tickets de caisse ;
* intégration avec des services tiers ;
* moteurs de recommandation plus avancés ;
* intelligence artificielle générative ;
* partage de recettes ;
* synchronisation avec des objets connectés.

Cette liste n'est pas exhaustive.

---

## 9.10 Liberté de conception

La présente spécification décrit les besoins fonctionnels, les comportements attendus ainsi que les contraintes connues du projet.

Elle ne constitue pas une spécification technique.

L'équipe en charge du développement reste libre de proposer les solutions techniques, architecturales ou ergonomiques qu'elle juge les plus adaptées.

Les technologies mentionnées dans ce document correspondent aux préférences actuelles du porteur de projet et ne doivent pas être considérées comme des obligations absolues.

Toute proposition permettant d'améliorer :

* la qualité du produit ;
* l'expérience utilisateur ;
* les performances ;
* la maintenabilité ;
* l'évolutivité ;
* la sécurité ;

est encouragée.

Les propositions d'amélioration devront néanmoins rester compatibles avec les objectifs fonctionnels définis dans cette spécification et être validées avec le porteur du projet avant leur mise en œuvre.

---

# 10. Exigences non fonctionnelles

Cette section décrit les attentes générales concernant la qualité du produit.

Ces exigences ne définissent pas les moyens techniques à employer mais les résultats attendus.

---

## 10.1 Performance

L'application devra offrir une expérience fluide sur smartphone comme sur ordinateur.

Les principales actions (navigation, recherche, consultation du stock, ouverture d'une recette, génération de la liste de courses) devront être perçues comme quasi instantanées dans un contexte d'utilisation normal.

---

## 10.2 Disponibilité

L'application devra être utilisable dans les principaux contextes d'usage :

* à domicile ;
* en magasin ;
* en cuisine.

Une réflexion devra être menée sur le fonctionnement en cas de perte temporaire de connexion afin de garantir une expérience utilisateur satisfaisante.

---

## 10.3 Sécurité

Les données personnelles et les données relatives aux foyers devront être protégées.

L'authentification, les autorisations et la protection des échanges devront être adaptées aux usages attendus.

Les choix techniques relèvent de l'équipe de développement.

---

## 10.4 Maintenabilité

Le projet devra être conçu afin de faciliter :

* les évolutions futures ;
* les corrections de bugs ;
* l'ajout de nouvelles fonctionnalités.

Une architecture modulaire est fortement recommandée.

---

## 10.5 Qualité des données

Le système devra privilégier la cohérence des informations.

Les incohérences devront être détectées autant que possible et signalées à l'utilisateur plutôt que corrigées automatiquement sans son accord.

---

## 10.6 Compatibilité

Le produit est pensé en priorité pour une utilisation sur smartphone sous forme de Progressive Web App (PWA).

L'utilisation sur ordinateur devra également être possible afin de faciliter les tâches nécessitant davantage de confort, comme la création de recettes, la consultation de statistiques ou l'administration du foyer.

---

## 10.7 Technologies privilégiées

Les préférences actuelles du porteur de projet sont les suivantes :

* Frontend : Angular, tailwind
* Backend : AdonisJS
* Base de données : PostgreSQL
* Déploiement : Docker
* Hébergement : VPS Ubuntu

Ces choix constituent une orientation technique souhaitée mais pourront être remis en question si une alternative apporte un bénéfice démontré et reste compatible avec les objectifs du projet.

## 10.8 Identité visuelle

À ce stade du projet, l'application ne dispose pas encore d'un nom définitif, d'un logo ou d'une charte graphique.

L'interface devra donc être développée à l'aide d'éléments temporaires (placeholders) facilement remplaçables.

La charte graphique devra être centralisée afin de permettre la modification des couleurs, des typographies, des icônes ou d'autres éléments d'identité visuelle sans nécessiter de modifications importantes dans le code de l'application.

L'objectif est de pouvoir définir ou faire évoluer l'identité visuelle du produit à tout moment du projet avec un impact minimal sur le développement.


# 11. Questions ouvertes et sujets de conception

Cette spécification fonctionnelle décrit les besoins métier, les objectifs du produit et les comportements attendus de l'application.

En revanche, certains sujets sont volontairement laissés ouverts afin de permettre à l'équipe de développement de proposer les solutions les plus adaptées. L'objectif n'est pas d'imposer une implémentation technique, mais de bénéficier pleinement de l'expertise de l'équipe en matière d'architecture, de conception logicielle et d'expérience utilisateur.

Les sujets suivants sont notamment laissés à l'appréciation de l'équipe :

* Architecture globale de l'application.
* Organisation du backend et du frontend.
* Conception de la base de données.
* Choix des modèles de données.
* Découpage en modules, services ou micro-services si jugé pertinent.
* Stratégie de synchronisation des données.
* Fonctionnement hors connexion (offline).
* Gestion des conflits de synchronisation.
* Choix des API ou services externes.
* Gestion de l'authentification et des autorisations.
* Sécurisation des échanges et des données.
* Optimisation des performances.
* Stratégie de cache.
* Journalisation et supervision.
* Pipeline de déploiement.
* Stratégie de tests.
* Choix des bibliothèques complémentaires.

Cette liste n'est pas exhaustive.

Toute proposition permettant d'améliorer le produit, l'expérience utilisateur, les performances, la maintenabilité, la sécurité ou l'évolutivité est encouragée.

Les propositions devront être argumentées et présentées au porteur du projet afin d'être étudiées conjointement avant leur mise en œuvre.
---

# 12. Conclusion

Cette spécification fonctionnelle constitue une première version du besoin exprimé par le porteur du projet.

Elle a pour objectif de formaliser la vision du produit ainsi que les principales règles de gestion attendues.

Ce document est volontairement évolutif. Il pourra être enrichi, corrigé ou complété tout au long de la phase de conception afin de prendre en compte les retours de l'équipe de développement, les contraintes techniques identifiées et les nouvelles idées susceptibles d'améliorer le produit.

L'objectif est de construire collectivement une application robuste, évolutive et agréable à utiliser.

Toutes les propositions d'amélioration sont les bienvenues dès lors qu'elles respectent la philosophie générale du projet :

* réduire la charge mentale de l'utilisateur ;
* automatiser les tâches répétitives lorsque cela est pertinent ;
* laisser à l'utilisateur la maîtrise de ses données ;
* privilégier la simplicité, la fiabilité et la maintenabilité du produit.

Cette spécification doit être considérée comme un document de travail partagé entre le porteur du projet et l'équipe de développement, servant de référence tout au long du projet.
