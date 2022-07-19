module.exports = {
    AnncouncedNumberArr: function (number, pattern) {
        if (pattern === "+") {
            return Math.floor(Math.random() * 90) - (parseInt(number) - 1)
        } else {
            return Math.floor(Math.random() * 90) + (parseInt(number) + 1)
            
        }
    },

    Game_rule_data: function (price) {
        const randomNumber = Math.floor(Math.random() * 9) + 1
        // if(price <= 100){
        //     return "+" + randomNumber
        // }else{
        //     return "-" + randomNumber
        // }

        const characters = '+-';

        function generateString(length) {
            let result='';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        return generateString(1) + randomNumber
    }
}