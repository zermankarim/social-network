const { Router } = require("express");
const { User } = require("../models");

const router = Router();

router.get("/search/get-all-users", async (req, res) => {
  const { peopleSearchParams } = req.query;

  if (peopleSearchParams) {
    const { searchInputValue, selectedFromAge, selectedToAge, selectedSex } =
      peopleSearchParams;
    try {
      const filter = {};
      if (selectedSex === "male" || selectedSex === "female") {
        filter["primary.sex"] = selectedSex;
      }

      function getBirthdayFromAge(age) {
        // Получаем текущую дату
        const currentDate = new Date();

        // Вычитаем возраст из текущего года, чтобы получить год рождения
        const birthYear = currentDate.getFullYear() - age;

        // Создаем новую дату с годом рождения, месяцем и днем по умолчанию
        const birthdayDate = new Date(birthYear, 0, 1); // Месяцы в JavaScript начинаются с 0 (0 - январь, 1 - февраль, и т.д.)

        // Форматируем дату в строку в нужном формате: год-месяц-день
        const formattedBirthday = birthdayDate.toISOString().split("T")[0];
        return formattedBirthday;
      }

      // If input
      if (searchInputValue) {
        const searchTerms = searchInputValue.split(" ");
        filter["$or"] = searchTerms.map((term) => ({
          "primary.name": { $regex: term, $options: "i" },
        }));
        filter["$or"].push(
          ...searchTerms.map((term) => ({
            "primary.surname": { $regex: term, $options: "i" },
          }))
        );
      }

      // if only "from age" selected
      if (selectedFromAge !== "0" && selectedToAge === "0") {
        filter["primary.dateOfBirth"] = {
          $lte: new Date(getBirthdayFromAge(selectedFromAge)),
        };
      }

      // if only "to age" selected
      if (selectedFromAge === "0" && selectedToAge !== "0") {
        filter["primary.dateOfBirth"] = {
          $gte: new Date(getBirthdayFromAge(selectedToAge)),
        };
      }

      // if "from age" and "to age" selected
      if (selectedFromAge !== "0" && selectedToAge !== "0") {
        filter["primary.dateOfBirth"] = {
          $lte: new Date(getBirthdayFromAge(selectedFromAge)),
          $gte: new Date(getBirthdayFromAge(selectedToAge)),
        };
      }
      
      const users = await User.find(filter, { secret: 0 }).limit(100);

      if (users) {
        res.json({ success: true, users });
      } else {
        res.json({
          success: false,
          message: "Something errors on /api/search/get-all-users",
        });
      }
    } catch (e) {
      console.error(e);
      return res.json({
        success: false,
        message: "Caugth error on get all users",
      });
    }
  } else {
    try {
      const users = await User.find({}, { secret: 0 }).limit(100);

      if (users) {
        res.json({ success: true, users });
      } else {
        res.json({
          success: false,
          message: "Something errors on /api/search/get-all-users",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
});

module.exports = router;
