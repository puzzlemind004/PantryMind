# Boîte à idées

Idées exprimées par le porteur du projet, à trier et prioriser ensemble
avant toute mise en œuvre. Aucun engagement : on note pour ne pas perdre,
on évalue ensuite (valeur / complexité / cohérence avec la spec).

| # | Idée | Notée le | Statut |
| --- | --- | --- | --- |
| 1 | **Scan en mode courses** : scanner un aliment en magasin coche automatiquement l'article correspondant dans la liste de courses (et l'ajoute au stock avec la bonne référence commerciale). | 2026-07-04 | À évaluer |
| 2 | **Scan de ticket de caisse** : remplir le stock d'un coup en photographiant le ticket (OCR + rapprochement produits). Déjà évoquée dans la spec §9.9 comme évolution envisagée. | 2026-07-04 | À évaluer |
| 3 | **Fusion de lots** : proposer de fusionner automatiquement les lots du même produit ayant la même date de péremption (la spec §6.1 prévoit déjà « fusionner ou séparer des lots » manuellement). | 2026-07-04 | À évaluer |
| 4 | **Duplication intelligente au planning** : dupliquer un repas vers plusieurs jours d'un coup (ex. : le petit-déjeuner, quasi identique, reporté sur toute la semaine). | 2026-07-04 | À évaluer |
| 5 | **Fenêtre de courses** : à la génération de la liste, donner la date des courses et la date des prochaines courses (défaut : aujourd'hui → +7 j). L'app projette le stock au jour des courses (en déduisant les repas planifiés d'ici là), puis calcule les besoins jusqu'aux courses suivantes ; la liste = la différence. Affine la logique actuelle « stock instantané − besoins à 7 jours ». | 2026-07-04 | À évaluer |
| 6 | **Filtres avancés du stock** : filtrer par emplacement, catégorie, etc. (l'API accepte déjà `storageLocationId` et `productId` ; il manque l'UI). | 2026-07-04 | À évaluer |

## Comment s'en servir

- Nouvelle idée → une ligne ici, sans se censurer.
- Avant chaque lot, on passe la liste en revue : `À évaluer` → `Retenue (lot N)` / `Écartée (raison)`.
