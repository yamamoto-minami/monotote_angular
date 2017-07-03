
(function(){
    "use strict";

    angular
    .module('cmp.currencies', [])
    .constant('CURRENCIES', getCurrencies())
    .filter('CurrencyFilter', CurrencyFilter)

    CurrencyFilter.$inject = ['CURRENCIES'];
    function CurrencyFilter(CURRENCIES) {
        function filter(price, currency) {
            if(!currency) return "";
            return formatMoney(
                price,
                getCurrencyObj(currency)
            )
        }

        function merge(obj){
            var source, prop;
            var il = arguments.length;

            for (var i = il - 1; i > 0; --i) {
                source = arguments[i];
                for (prop in source) {
                    if (source[prop] && source[prop].constructor &&
                        source[prop].constructor === Object) {
                        obj[prop] = obj[prop] || {};
                        arguments.callee(obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        }

        function getCurrencyObj(currency){

            // Build options object from second param (if object) or all params, extending defaults:
            var opts = merge(
                {
                    format: "%s%v",
                    decimal: ".",
                    thousand: ",",
                    precision: 2,
                    grouping: 3
                },
                CURRENCIES[currency.toLowerCase()]
            );

            return opts;
        }

        function checkPrecision(val, base) {
            val = Math.round(Math.abs(val));
            return isNaN(val)? base : val;
        }

        function formatNumber(number, precision, thousand, decimal, grouping) {
            // Build options object from second param (if object) or all params, extending defaults:
            var opts = merge(
                {
                    precision : 2,		// default precision on numbers is 0
                    grouping : 3,		  // digit grouping
                    thousand : ",",
                    decimal : "."
                },
                (Object.prototype.toString.call(precision) === '[object Object]' ? precision : {
                    precision : precision,
                    thousand : thousand,
                    decimal : decimal,
                    grouping : grouping
                })
            ),

            // Clean up precision
            usePrecision = checkPrecision(opts.precision),

            // Do some calc:
            negative = number < 0 ? "-" : "",
            base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
            mod = base.length > opts.grouping ? base.length % opts.grouping : 0;

            // Format the number:
            var regex = new RegExp('(\\d{'+opts.grouping+'})(?=\\d)', 'g');
            return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(regex, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
        }

        function toFixed(value, precision) {
            precision = checkPrecision(precision, 0);
            var power = Math.pow(10, precision);

            // Multiply up by precision, round accurately, then divide and use native toFixed():
            return (Math.round(value * power) / power).toFixed(precision);
        }

        function formatMoney(number, symbol, precision, thousand, decimal, format, grouping) {
            // Build options object from second param (if object) or all params, extending defaults:
            var opts = merge(
                {
                    symbol : "$",		  // default currency symbol is '$'
                    format : "%s%v",	// controls output: %s = symbol, %v = value (can be object)
                    decimal : ".",		// decimal point separator
                    thousand : ",",		// thousands separator
                    precision : 2,		// decimal places
                    grouping : 3		  // digit grouping
                },
                (Object.prototype.toString.call(symbol) === '[object Object]' ? symbol : {
                    symbol : symbol,
                    precision : precision,
                    thousand : thousand,
                    decimal : decimal,
                    format : format,
                    grouping : grouping
                })
            ),

            // format object with pos, neg and zero:
            formats = {
                pos : opts.format,
                neg : opts.format.replace("-", "").replace("%v", "-%v"),
                zero: opts.format
            },

            // Choose which format to use for this value:
            useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

            // Return with currency symbol added:
		    return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), opts));
        }

        return filter;
    }

    function getCurrencies() {
        return {
            usd: {symbol:'$'},
            cad: {symbol:'CA$'},
            eur: {
                symbol:'€',
                decimal: ',',
                thousand: '.'
            },
            aed: {symbol:'AED'},
            afn: {symbol:'Af'},
            all: {symbol:'ALL'},
            amd: {symbol:'AMD'},
            ars: {symbol:'AR$'},
            aud: {symbol:'AU$'},
            azn: {symbol:'man.'},
            bam: {symbol:'KM'},
            bdt: {symbol:'Tk'},
            bgn: {symbol:'BGN'},
            bhd: {symbol:'BD'},
            bif: {symbol:'FBu'},
            bnd: {symbol:'BN$'},
            bob: {symbol:'Bs'},
            brl: {symbol:'R$'},
            bwp: {symbol:'BWP'},
            byr: {symbol:'BYR'},
            bzd: {symbol:'BZ$'},
            cdf: {symbol:'CDF'},
            chf: {symbol:'CHF'},
            clp: {symbol:'CL$'},
            cny: {symbol:'CN¥'},
            cop: {symbol:'CO$'},
            crc: {symbol:'₵'},
            cve: {symbol:'CV$'},
            czk: {symbol:'Kč'},
            djf: {symbol:'Fdj'},
            dkk: {symbol:'Dkr'},
            dop: {symbol:'RD$'},
            dzd: {symbol:'DA'},
            eek: {symbol:'Ekr'},
            egp: {symbol:'EGP'},
            ern: {symbol:'Nfk'},
            etb: {symbol:'Br'},
            gbp: {
                symbol:'£',
                decimal: '.',
                thousand: ','
            },
            gel: {symbol:'GEL'},
            ghs: {symbol:'GH₵'},
            gnf: {symbol:'FG'},
            gtq: {symbol:'GTQ'},
            hkd: {symbol:'HK$'},
            hnl: {symbol:'HNL'},
            hrk: {symbol:'kn'},
            huf: {symbol:'Ft'},
            idr: {symbol:'Rp'},
            ils: {symbol:'₪'},
            inr: {symbol:'Rs'},
            iqd: {symbol:'IQD'},
            irr: {symbol:'IRR'},
            isk: {symbol:'Ikr'},
            jmd: {symbol:'J$'},
            jod: {symbol:'JD'},
            jpy: {symbol:'¥'},
            kes: {symbol:'Ksh'},
            khr: {symbol:'KHR'},
            kmf: {symbol:'CF'},
            krw: {symbol:'₩'},
            kwd: {symbol:'KD'},
            kzt: {symbol:'KZT'},
            lbp: {symbol:'LB£'},
            lkr: {symbol:'SLRs'},
            ltl: {symbol:'Lt'},
            lvl: {symbol:'Ls'},
            lyd: {symbol:'LD'},
            mad: {symbol:'MAD'},
            mdl: {symbol:'MDL'},
            mga: {symbol:'MGA'},
            mkd: {symbol:'MKD'},
            mmk: {symbol:'MMK'},
            mop: {symbol:'MOP$'},
            mur: {symbol:'MURs'},
            mxn: {symbol:'MX$'},
            myr: {symbol:'RM'},
            mzn: {symbol:'MTn'},
            nad: {symbol:'N$'},
            ngn: {symbol:'₦'},
            nio: {symbol:'C$'},
            nok: {symbol:'Nkr'},
            npr: {symbol:'NPRs'},
            nzd: {symbol:'NZ$'},
            omr: {symbol:'OMR'},
            pab: {symbol:'B/.'},
            pen: {symbol:'S/.'},
            php: {symbol:'₱'},
            pkr: {symbol:'PKRs'},
            pln: {symbol:'zł'},
            pyg: {symbol:'₲'},
            qar: {symbol:'QR'},
            ron: {symbol:'RON'},
            rsd: {symbol:'din.'},
            rub: {symbol:'RUB'},
            rwf: {symbol:'RWF'},
            sar: {symbol:'SR'},
            sdg: {symbol:'SDG'},
            sek: {symbol:'Skr'},
            sgd: {symbol:'S$'},
            sos: {symbol:'Ssh'},
            syp: {symbol:'SY£'},
            thb: {symbol:'฿'},
            tnd: {symbol:'DT'},
            top: {symbol:'T$'},
            try: {symbol:'TL'},
            ttd: {symbol:'TT$'},
            twd: {symbol:'NT$'},
            tzs: {symbol:'TSh'},
            uah: {symbol:'₴'},
            ugx: {symbol:'USh'},
            uyu: {symbol:'$U'},
            uzs: {symbol:'UZS'},
            vef: {symbol:'Bs.F.'},
            vnd: {symbol:'₫'},
            xaf: {symbol:'FCFA'},
            xof: {symbol:'CFA'},
            yer: {symbol:'YR'},
            zar: {symbol:'R'},
            zmk: {symbol:'ZK'}
        };
    }
})();