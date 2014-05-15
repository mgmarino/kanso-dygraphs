/*
 strftime for Javascript
 Copyright (c) 2008, Philip S Tellis <philip@bluesmoon.info>
 All rights reserved.
 
 This code is distributed under the terms of the BSD licence
 
 Redistribution and use of this software in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

   * Redistributions of source code must retain the above copyright notice, this list of conditions
     and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other materials provided
     with the distribution.
   * The names of the contributors to this file may not be used to endorse or promote products
     derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * \file strftime.js
 * \author Philip S Tellis \<philip@bluesmoon.info\>
 * \version 1.3
 * \date 2008/06
 * \brief Javascript implementation of strftime
 * 
 * Implements strftime for the Date object in javascript based on the PHP implementation described at
 * http://www.php.net/strftime  This is in turn based on the Open Group specification defined
 * at http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html This implementation does not
 * include modified conversion specifiers (i.e., Ex and Ox)
 *
 * The following format specifiers are supported:
 *
 * \copydoc formats
 *
 * \%a, \%A, \%b and \%B should be localised for non-English locales.
 *
 * \par Usage:
 * This library may be used as follows:
 * \code
 *     var d = new Date();
 *
 *     var ymd = d.strftime('%Y/%m/%d');
 *     var iso = d.strftime('%Y-%m-%dT%H:%M:%S%z');
 *
 * \endcode
 *
 * \sa \link Date.prototype.strftime Date.strftime \endlink for a description of each of the supported format specifiers
 * \sa Date.ext.locales for localisation information
 * \sa http://www.php.net/strftime for the PHP implementation which is the basis for this
 * \sa http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html for feedback
 */

//! Date extension object - all supporting objects go in here.
Date.ext = {};

//! Utility methods
Date.ext.util = {};

/**
\brief Left pad a number with something
\details Takes a number and pads it to the left with the passed in pad character
\param x	The number to pad
\param pad	The string to pad with
\param r	[optional] Upper limit for pad.  A value of 10 pads to 2 digits, a value of 100 pads to 3 digits.
		Default is 10.

\return The number left padded with the pad character.  This function returns a string and not a number.
*/
Date.ext.util.xPad=function(x, pad, r)
{
	if(typeof(r) == 'undefined')
	{
		r=10;
	}
	for( ; parseInt(x, 10)<r && r>1; r/=10)
		x = pad.toString() + x;
	return x.toString();
};

/**
\brief Currently selected locale.
\details
The locale for a specific date object may be changed using \code Date.locale = "new-locale"; \endcode
The default will be based on the lang attribute of the HTML tag of your document
*/
Date.prototype.locale = 'en-GB';
//! \cond FALSE
if(document.getElementsByTagName('html') && document.getElementsByTagName('html')[0].lang)
{
	Date.prototype.locale = document.getElementsByTagName('html')[0].lang;
}
//! \endcond

/**
\brief Localised strings for days of the week and months of the year.
\details
To create your own local strings, add a locale object to the locales object.
The key of your object should be the same as your locale name.  For example:
   en-US,
   fr,
   fr-CH,
   de-DE
Names are case sensitive and are described at http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
Your locale object must contain the following keys:
\param a	Short names of days of week starting with Sunday
\param A	Long names days of week starting with Sunday
\param b	Short names of months of the year starting with January
\param B	Long names of months of the year starting with February
\param c	The preferred date and time representation in your locale
\param p	AM or PM in your locale
\param P	am or pm in your locale
\param x	The  preferred date representation for the current locale without the time.
\param X	The preferred time representation for the current locale without the date.

\sa Date.ext.locales.en for a sample implementation
\sa \ref localisation for detailed documentation on localising strftime for your own locale
*/
Date.ext.locales = { };

/**
 * \brief Localised strings for English (British).
 * \details
 * This will be used for any of the English dialects unless overridden by a country specific one.
 * This is the default locale if none specified
 */
Date.ext.locales.en = {
	a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	c: '%a %d %b %Y %T %Z',
	p: ['AM', 'PM'],
	P: ['am', 'pm'],
	x: '%d/%m/%y',
	X: '%T'
};

//! \cond FALSE
// Localised strings for US English
Date.ext.locales['en-US'] = Date.ext.locales.en;
Date.ext.locales['en-US'].c = '%a %d %b %Y %r %Z';
Date.ext.locales['en-US'].x = '%D';
Date.ext.locales['en-US'].X = '%r';

// Localised strings for British English
Date.ext.locales['en-GB'] = Date.ext.locales.en;

// Localised strings for Australian English
Date.ext.locales['en-AU'] = Date.ext.locales['en-GB'];
//! \endcond

//! \brief List of supported format specifiers.
/**
 * \details
 * \arg \%a - abbreviated weekday name according to the current locale
 * \arg \%A - full weekday name according to the current locale
 * \arg \%b - abbreviated month name according to the current locale
 * \arg \%B - full month name according to the current locale
 * \arg \%c - preferred date and time representation for the current locale
 * \arg \%C - century number (the year divided by 100 and truncated to an integer, range 00 to 99)
 * \arg \%d - day of the month as a decimal number (range 01 to 31)
 * \arg \%D - same as %m/%d/%y
 * \arg \%e - day of the month as a decimal number, a single digit is preceded by a space (range ' 1' to '31')
 * \arg \%g - like %G, but without the century
 * \arg \%G - The 4-digit year corresponding to the ISO week number
 * \arg \%h - same as %b
 * \arg \%H - hour as a decimal number using a 24-hour clock (range 00 to 23)
 * \arg \%I - hour as a decimal number using a 12-hour clock (range 01 to 12)
 * \arg \%j - day of the year as a decimal number (range 001 to 366)
 * \arg \%m - month as a decimal number (range 01 to 12)
 * \arg \%M - minute as a decimal number
 * \arg \%n - newline character
 * \arg \%p - either `AM' or `PM' according to the given time value, or the corresponding strings for the current locale
 * \arg \%P - like %p, but lower case
 * \arg \%r - time in a.m. and p.m. notation equal to %I:%M:%S %p
 * \arg \%R - time in 24 hour notation equal to %H:%M
 * \arg \%S - second as a decimal number
 * \arg \%t - tab character
 * \arg \%T - current time, equal to %H:%M:%S
 * \arg \%u - weekday as a decimal number [1,7], with 1 representing Monday
 * \arg \%U - week number of the current year as a decimal number, starting with
 *            the first Sunday as the first day of the first week
 * \arg \%V - The ISO 8601:1988 week number of the current year as a decimal number,
 *            range 01 to 53, where week 1 is the first week that has at least 4 days
 *            in the current year, and with Monday as the first day of the week.
 * \arg \%w - day of the week as a decimal, Sunday being 0
 * \arg \%W - week number of the current year as a decimal number, starting with the
 *            first Monday as the first day of the first week
 * \arg \%x - preferred date representation for the current locale without the time
 * \arg \%X - preferred time representation for the current locale without the date
 * \arg \%y - year as a decimal number without a century (range 00 to 99)
 * \arg \%Y - year as a decimal number including the century
 * \arg \%z - numerical time zone representation
 * \arg \%Z - time zone name or abbreviation
 * \arg \% - a literal `\%' character
 */
Date.ext.formats = {
	a: function(d) { return Date.ext.locales[d.locale].a[d.getDay()]; },
	A: function(d) { return Date.ext.locales[d.locale].A[d.getDay()]; },
	b: function(d) { return Date.ext.locales[d.locale].b[d.getMonth()]; },
	B: function(d) { return Date.ext.locales[d.locale].B[d.getMonth()]; },
	c: 'toLocaleString',
	C: function(d) { return Date.ext.util.xPad(parseInt(d.getFullYear()/100, 10), 0); },
	d: ['getDate', '0'],
	e: ['getDate', ' '],
	g: function(d) { return Date.ext.util.xPad(parseInt(Date.ext.util.G(d)/100, 10), 0); },
	G: function(d) {
			var y = d.getFullYear();
			var V = parseInt(Date.ext.formats.V(d), 10);
			var W = parseInt(Date.ext.formats.W(d), 10);

			if(W > V) {
				y++;
			} else if(W===0 && V>=52) {
				y--;
			}

			return y;
		},
	H: ['getHours', '0'],
	I: function(d) { var I=d.getHours()%12; return Date.ext.util.xPad(I===0?12:I, 0); },
	j: function(d) {
			var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
			ms += d.getTimezoneOffset()*60000;
			var doy = parseInt(ms/60000/60/24, 10)+1;
			return Date.ext.util.xPad(doy, 0, 100);
		},
	m: function(d) { return Date.ext.util.xPad(d.getMonth()+1, 0); },
	M: ['getMinutes', '0'],
	p: function(d) { return Date.ext.locales[d.locale].p[d.getHours() >= 12 ? 1 : 0 ]; },
	P: function(d) { return Date.ext.locales[d.locale].P[d.getHours() >= 12 ? 1 : 0 ]; },
	S: ['getSeconds', '0'],
	u: function(d) { var dow = d.getDay(); return dow===0?7:dow; },
	U: function(d) {
			var doy = parseInt(Date.ext.formats.j(d), 10);
			var rdow = 6-d.getDay();
			var woy = parseInt((doy+rdow)/7, 10);
			return Date.ext.util.xPad(woy, 0);
		},
	V: function(d) {
			var woy = parseInt(Date.ext.formats.W(d), 10);
			var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
			// First week is 01 and not 00 as in the case of %U and %W,
			// so we add 1 to the final result except if day 1 of the year
			// is a Monday (then %W returns 01).
			// We also need to subtract 1 if the day 1 of the year is 
			// Friday-Sunday, so the resulting equation becomes:
			var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
			if(idow == 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4)
			{
				idow = 1;
			}
			else if(idow === 0)
			{
				idow = Date.ext.formats.V(new Date('' + (d.getFullYear()-1) + '/12/31'));
			}

			return Date.ext.util.xPad(idow, 0);
		},
	w: 'getDay',
	W: function(d) {
			var doy = parseInt(Date.ext.formats.j(d), 10);
			var rdow = 7-Date.ext.formats.u(d);
			var woy = parseInt((doy+rdow)/7, 10);
			return Date.ext.util.xPad(woy, 0, 10);
		},
	y: function(d) { return Date.ext.util.xPad(d.getFullYear()%100, 0); },
	Y: 'getFullYear',
	z: function(d) {
			var o = d.getTimezoneOffset();
			var H = Date.ext.util.xPad(parseInt(Math.abs(o/60), 10), 0);
			var M = Date.ext.util.xPad(o%60, 0);
			return (o>0?'-':'+') + H + M;
		},
	Z: function(d) { return d.toString().replace(/^.*\(([^)]+)\)$/, '$1'); },
	'%': function(d) { return '%'; }
};

/**
\brief List of aggregate format specifiers.
\details
Aggregate format specifiers map to a combination of basic format specifiers.
These are implemented in terms of Date.ext.formats.

A format specifier that maps to 'locale' is read from Date.ext.locales[current-locale].

\sa Date.ext.formats
*/
Date.ext.aggregates = {
	c: 'locale',
	D: '%m/%d/%y',
	h: '%b',
	n: '\n',
	r: '%I:%M:%S %p',
	R: '%H:%M',
	t: '\t',
	T: '%H:%M:%S',
	x: 'locale',
	X: 'locale'
};

//! \cond FALSE
// Cache timezone values because they will never change for a given JS instance
Date.ext.aggregates.z = Date.ext.formats.z(new Date());
Date.ext.aggregates.Z = Date.ext.formats.Z(new Date());
//! \endcond

//! List of unsupported format specifiers.
/**
 * \details
 * All format specifiers supported by the PHP implementation are supported by
 * this javascript implementation.
 */
Date.ext.unsupported = { };


/**
 * \brief Formats the date according to the specified format.
 * \param fmt	The format to format the date in.  This may be a combination of the following:
 * \copydoc formats
 *
 * \return	A string representation of the date formatted based on the passed in parameter
 * \sa http://www.php.net/strftime for documentation on format specifiers
*/
Date.prototype.strftime=function(fmt)
{
	// Fix locale if declared locale hasn't been defined
	// After the first call this condition should never be entered unless someone changes the locale
	if(!(this.locale in Date.ext.locales))
	{
		if(this.locale.replace(/-[a-zA-Z]+$/, '') in Date.ext.locales)
		{
			this.locale = this.locale.replace(/-[a-zA-Z]+$/, '');
		}
		else
		{
			this.locale = 'en-GB';
		}
	}

	var d = this;
	// First replace aggregates
	while(fmt.match(/%[cDhnrRtTxXzZ]/))
	{
		fmt = fmt.replace(/%([cDhnrRtTxXzZ])/g, function(m0, m1)
				{
					var f = Date.ext.aggregates[m1];
					return (f == 'locale' ? Date.ext.locales[d.locale][m1] : f);
				});
	}


	// Now replace formats - we need a closure so that the date object gets passed through
	var str = fmt.replace(/%([aAbBCdegGHIjmMpPSuUVwWyY%])/g, function(m0, m1) 
			{
				var f = Date.ext.formats[m1];
				if(typeof(f) == 'string') {
					return d[f]();
				} else if(typeof(f) == 'function') {
					return f.call(d, d);
				} else if(typeof(f) == 'object' && typeof(f[0]) == 'string') {
					return Date.ext.util.xPad(d[f[0]](), f[1]);
				} else {
					return m1;
				}
			});
	d=null;
	return str;
};

/**
 * \mainpage strftime for Javascript
 *
 * \section toc Table of Contents
 * - \ref intro_sec
 * - <a class="el" href="strftime.js">Download full source</a> / <a class="el" href="strftime-min.js">minified</a>
 * - \subpage usage
 * - \subpage format_specifiers
 * - \subpage localisation
 * - \link strftime.js API Documentation \endlink
 * - \subpage demo
 * - \subpage changelog
 * - \subpage faq
 * - <a class="el" href="http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html">Feedback</a>
 * - \subpage copyright_licence
 *
 * \section intro_sec Introduction
 *
 * C and PHP developers have had access to a built in strftime function for a long time.
 * This function is an easy way to format dates and times for various display needs.
 *
 * This library brings the flexibility of strftime to the javascript Date object
 *
 * Use this library if you frequently need to format dates in javascript in a variety of ways.  For example,
 * if you have PHP code that writes out formatted dates, and want to mimic the functionality using
 * progressively enhanced javascript, then this library can do exactly what you want.
 *
 *
 *
 *
 * \page usage Example usage
 *
 * \section usage_sec Usage
 * This library may be used as follows:
 * \code
 *     var d = new Date();
 *
 *     var ymd = d.strftime('%Y/%m/%d');
 *     var iso = d.strftime('%Y-%m-%dT%H:%M:%S%z');
 *
 * \endcode
 *
 * \subsection examples Examples
 * 
 * To get the current time in hours and minutes:
 * \code
 * 	var d = new Date();
 * 	d.strftime("%H:%M");
 * \endcode
 *
 * To get the current time with seconds in AM/PM notation:
 * \code
 * 	var d = new Date();
 * 	d.strftime("%r");
 * \endcode
 *
 * To get the year and day of the year for August 23, 2009:
 * \code
 * 	var d = new Date('2009/8/23');
 * 	d.strftime("%Y-%j");
 * \endcode
 *
 * \section demo_sec Demo
 *
 * Try your own examples on the \subpage demo page.  You can use any of the supported
 * \subpage format_specifiers.
 *
 *
 *
 *
 * \page localisation Localisation
 * You can localise strftime by implementing the short and long forms for days of the
 * week and months of the year, and the localised aggregates for the preferred date
 * and time representation for your locale.  You need to add your locale to the
 * Date.ext.locales object.
 *
 * \section localising_fr Localising for french
 *
 * For example, this is how we'd add French language strings to the locales object:
 * \dontinclude index.html
 * \skip Generic french
 * \until };
 * The % format specifiers are all defined in \ref formats.  You can use any of those.
 *
 * This locale definition may be included in your own source file, or in the HTML file
 * including \c strftime.js, however it must be defined \em after including \c strftime.js
 *
 * The above definition includes generic french strings and formats that are used in France.
 * Other french speaking countries may have other representations for dates and times, so we
 * need to override this for them.  For example, Canadian french uses a Y-m-d date format,
 * while French french uses d.m.Y.  We fix this by defining Canadian french to be the same
 * as generic french, and then override the format specifiers for \c x for the \c fr-CA locale:
 * \until End french
 *
 * You can now use any of the French locales at any time by setting \link Date.prototype.locale Date.locale \endlink
 * to \c "fr", \c "fr-FR", \c "fr-CA", or any other french dialect:
 * \code
 *     var d = new Date("2008/04/22");
 *     d.locale = "fr";
 *
 *     d.strftime("%A, %d %B == %x");
 * \endcode
 * will return:
 * \code
 *     mardi, 22 avril == 22.04.2008
 * \endcode
 * While changing the locale to "fr-CA":
 * \code
 *     d.locale = "fr-CA";
 *
 *     d.strftime("%A, %d %B == %x");
 * \endcode
 * will return:
 * \code
 *     mardi, 22 avril == 2008-04-22
 * \endcode
 *
 * You can use any of the format specifiers defined at \ref formats
 *
 * The locale for all dates defaults to the value of the \c lang attribute of your HTML document if
 * it is set, or to \c "en" otherwise.
 * \note
 * Your locale definitions \b MUST be added to the locale object before calling
 * \link Date.prototype.strftime Date.strftime \endlink.
 *
 * \sa \ref formats for a list of format specifiers that can be used in your definitions
 * for c, x and X.
 *
 * \section locale_names Locale names
 *
 * Locale names are defined in RFC 1766. Typically, a locale would be a two letter ISO639
 * defined language code and an optional ISO3166 defined country code separated by a -
 * 
 * eg: fr-FR, de-DE, hi-IN
 *
 * \sa http://www.ietf.org/rfc/rfc1766.txt
 * \sa http://www.loc.gov/standards/iso639-2/php/code_list.php
 * \sa http://www.iso.org/iso/country_codes/iso_3166_code_lists/english_country_names_and_code_elements.htm
 * 
 * \section locale_fallback Locale fallbacks
 *
 * If a locale object corresponding to the fully specified locale isn't found, an attempt will be made
 * to fall back to the two letter language code.  If a locale object corresponding to that isn't found
 * either, then the locale will fall back to \c "en".  No warning will be issued.
 *
 * For example, if we define a locale for de:
 * \until };
 * Then set the locale to \c "de-DE":
 * \code
 *     d.locale = "de-DE";
 *
 *     d.strftime("%a, %d %b");
 * \endcode
 * In this case, the \c "de" locale will be used since \c "de-DE" has not been defined:
 * \code
 *     Di, 22 Apr
 * \endcode
 *
 * Swiss german will return the same since it will also fall back to \c "de":
 * \code
 *     d.locale = "de-CH";
 *
 *     d.strftime("%a, %d %b");
 * \endcode
 * \code
 *     Di, 22 Apr
 * \endcode
 *
 * We need to override the \c a specifier for Swiss german, since it's different from German german:
 * \until End german
 * We now get the correct results:
 * \code
 *     d.locale = "de-CH";
 *
 *     d.strftime("%a, %d %b");
 * \endcode
 * \code
 *     Die, 22 Apr
 * \endcode
 *
 * \section builtin_locales Built in locales
 *
 * This library comes with pre-defined locales for en, en-GB, en-US and en-AU.
 *
 * 
 *
 *
 * \page format_specifiers Format specifiers
 * 
 * \section specifiers Format specifiers
 * strftime has several format specifiers defined by the Open group at 
 * http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html
 *
 * PHP added a few of its own, defined at http://www.php.net/strftime
 *
 * This javascript implementation supports all the PHP specifiers
 *
 * \subsection supp Supported format specifiers:
 * \copydoc formats
 * 
 * \subsection unsupportedformats Unsupported format specifiers:
 * \copydoc unsupported
 *
 *
 *
 *
 * \page demo strftime demo
 * <div style="float:right;width:45%;">
 * \copydoc formats
 * </div>
 * \htmlinclude index.html
 *
 *
 *
 *
 * \page faq FAQ
 * 
 * \section how_tos Usage
 *
 * \subsection howtouse Is there a manual on how to use this library?
 *
 * Yes, see \ref usage
 *
 * \subsection wheretoget Where can I get a minified version of this library?
 *
 * The minified version is available <a href="strftime-min.js" title="Minified strftime.js">here</a>.
 *
 * \subsection which_specifiers Which format specifiers are supported?
 *
 * See \ref format_specifiers
 *
 * \section whys Why?
 *
 * \subsection why_lib Why this library?
 *
 * I've used the strftime function in C, PHP and the Unix shell, and found it very useful
 * to do date formatting.  When I needed to do date formatting in javascript, I decided
 * that it made the most sense to just reuse what I'm already familiar with.
 *
 * \subsection why_another Why another strftime implementation for Javascript?
 *
 * Yes, there are other strftime implementations for Javascript, but I saw problems with
 * all of them that meant I couldn't use them directly.  Some implementations had bad
 * designs.  For example, iterating through all possible specifiers and scanning the string
 * for them.  Others were tied to specific libraries like prototype.
 *
 * Trying to extend any of the existing implementations would have required only slightly
 * less effort than writing this from scratch.  In the end it took me just about 3 hours
 * to write the code and about 6 hours battling with doxygen to write these docs.
 *
 * I also had an idea of how I wanted to implement this, so decided to try it.
 *
 * \subsection why_extend_date Why extend the Date class rather than subclass it?
 *
 * I tried subclassing Date and failed.  I didn't want to waste time on figuring
 * out if there was a problem in my code or if it just wasn't possible.  Adding to the
 * Date.prototype worked well, so I stuck with it.
 *
 * I did have some worries because of the way for..in loops got messed up after json.js added
 * to the Object.prototype, but that isn't an issue here since {} is not a subclass of Date.
 *
 * My last doubt was about the Date.ext namespace that I created.  I still don't like this,
 * but I felt that \c ext at least makes clear that this is external or an extension.
 *
 * It's quite possible that some future version of javascript will add an \c ext or a \c locale
 * or a \c strftime property/method to the Date class, but this library should probably
 * check for capabilities before doing what it does.
 *
 * \section curiosity Curiosity
 *
 * \subsection how_big How big is the code?
 *
 * \arg 26K bytes with documentation
 * \arg 4242 bytes minified using <a href="http://developer.yahoo.com/yui/compressor/">YUI Compressor</a>
 * \arg 1477 bytes minified and gzipped
 *
 * \subsection how_long How long did it take to write this?
 *
 * 15 minutes for the idea while I was composing this blog post:
 * http://tech.bluesmoon.info/2008/04/javascript-date-functions.html
 *
 * 3 hours in one evening to write v1.0 of the code and 6 hours the same
 * night to write the docs and this manual.  As you can tell, I'm fairly
 * sleepy.
 *
 * Versions 1.1 and 1.2 were done in a couple of hours each, and version 1.3
 * in under one hour.
 *
 * \section contributing Contributing
 *
 * \subsection how_to_rfe How can I request features or make suggestions?
 *
 * You can leave a comment on my blog post about this library here:
 * http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html
 *
 * \subsection how_to_contribute Can I/How can I contribute code to this library?
 *
 * Yes, that would be very nice, thank you.  You can do various things.  You can make changes
 * to the library, and make a diff against the current file and mail me that diff at
 * philip@bluesmoon.info, or you could just host the new file on your own servers and add
 * your name to the copyright list at the top stating which parts you've added.
 *
 * If you do mail me a diff, let me know how you'd like to be listed in the copyright section.
 *
 * \subsection copyright_signover Who owns the copyright on contributed code?
 *
 * The contributor retains copyright on contributed code.
 *
 * In some cases I may use contributed code as a template and write the code myself.  In this
 * case I'll give the contributor credit for the idea, but will not add their name to the
 * copyright holders list.
 *
 *
 *
 *
 * \page copyright_licence Copyright & Licence
 *
 * \section copyright Copyright
 * \dontinclude strftime.js
 * \skip Copyright
 * \until rights
 *
 * \section licence Licence
 * \skip This code
 * \until SUCH DAMAGE.
 *
 *
 *
 * \page changelog ChangeLog
 *
 * \par 1.3 - 2008/06/17:
 * - Fixed padding issue with negative timezone offsets in %r
 *   reported and fixed by Mikko <mikko.heimola@iki.fi>
 * - Added support for %P
 * - Internationalised %r, %p and %P
 *
 * \par 1.2 - 2008/04/27:
 * - Fixed support for c (previously it just returned toLocaleString())
 * - Add support for c, x and X
 * - Add locales for en-GB, en-US and en-AU
 * - Make en-GB the default locale (previous was en)
 * - Added more localisation docs
 *
 * \par 1.1 - 2008/04/27:
 * - Fix bug in xPad which wasn't padding more than a single digit
 * - Fix bug in j which had an off by one error for days after March 10th because of daylight savings
 * - Add support for g, G, U, V and W
 *
 * \par 1.0 - 2008/04/22:
 * - Initial release with support for a, A, b, B, c, C, d, D, e, H, I, j, m, M, p, r, R, S, t, T, u, w, y, Y, z, Z, and %
 */

/**
 * A class to parse color values
 *
 * NOTE: modified by danvk. I removed the "getHelpXML" function to reduce the
 * file size, added "use strict" and a few "var" declarations where needed.
 *
 * Modifications by adilh:
 * Original "RGBColor" function name collides with:
 *   http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-RGBColor
 * so renamed to "RGBColorParser"
 *
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
"use strict";

function RGBColorParser(color_string)
{
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }


}


// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {
};

printStackTrace.implementation.prototype = {
    /**
     * @param {Error} ex The error to create a stacktrace from (optional)
     * @param {String} mode Forced mode (optional, mostly for unit tests)
     */
    run: function(ex, mode) {
        ex = ex || this.createException();
        // examine exception properties w/o debugger
        //for (var prop in ex) {alert("Ex['" + prop + "']=" + ex[prop]);}
        mode = mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
        } catch (e) {
            return e;
        }
    },

    /**
     * Mode could differ for different exception, e.g.
     * exceptions in Chrome may or may not have arguments or stack.
     *
     * @return {String} mode of operation for the exception
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return 'chrome';
        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            // e.message.indexOf("Backtrace:") > -1 -> opera
            // !e.stacktrace -> opera
            if (!e.stacktrace) {
                return 'opera9'; // use e.message
            }
            // 'opera#sourceloc' in e -> opera9, opera10a
            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return 'opera9'; // use e.message
            }
            // e.stacktrace && !e.stack -> opera10a
            if (!e.stack) {
                return 'opera10a'; // use e.stacktrace
            }
            // e.stacktrace && e.stack -> opera10b
            if (e.stacktrace.indexOf("called from line") < 0) {
                return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
            }
            // e.stacktrace && e.stack -> opera11
            return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
        } else if (e.stack) {
            return 'firefox';
        }
        return 'other';
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    opera11: function(e) {
        // "Error thrown at line 42, column 12 in <anonymous function>() in file://localhost/G:/js/stacktrace.js:\n"
        // "Error thrown at line 42, column 12 in <anonymous function: createException>() in file://localhost/G:/js/stacktrace.js:\n"
        // "called from line 7, column 4 in bar(n) in file://localhost/G:/js/test/functional/testcase1.html:\n"
        // "called from line 15, column 3 in file://localhost/G:/js/test/functional/testcase1.html:\n"
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    opera10b: function(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var ANON = '{anonymous}', lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1]? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10a: function(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Opera 7.x-9.2x only!
    opera9: function(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                }
            }
        }
        return result.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (req) {
            try {
                req.open('GET', url, false);
                req.send(null);
                return req.responseText;
            } catch (e) {
            }
        }
        return '';
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return url.indexOf(location.hostname) !== -1;
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <Array> Array of source code lines
     */
    getSource: function(url) {
        // TODO reuse source from script tags?
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(.*)/,
                reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                frame = stack[i], ref = reStack.exec(frame);

            if (ref) {
                var m = reRef.exec(ref[1]), file = m[1],
                    lineno = m[2], charno = m[3] || 0;
                if (file && this.isSameDomain(file) && lineno) {
                    var functionName = this.guessAnonymousFunction(file, lineno, charno);
                    stack[i] = frame.replace('{anonymous}', functionName);
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // TODO use captured args
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i - 1];
            commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }
            // TODO check other types of comments? Commented code may lead to false positive
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview Adds support for dashed lines to the HTML5 canvas.
 *
 * Usage:
 *   var ctx = canvas.getContext("2d");
 *   ctx.installPattern([10, 5])  // draw 10 pixels, skip 5 pixels, repeat.
 *   ctx.beginPath();
 *   ctx.moveTo(100, 100);  // start the first line segment.
 *   ctx.lineTo(150, 200);
 *   ctx.lineTo(200, 100);
 *   ctx.moveTo(300, 150);  // start a second, unconnected line
 *   ctx.lineTo(400, 250);
 *   ...
 *   ctx.stroke();          // draw the dashed line.
 *   ctx.uninstallPattern();
 *
 * This is designed to leave the canvas untouched when it's not used.
 * If you never install a pattern, or call uninstallPattern(), then the canvas
 * will be exactly as it would have if you'd never used this library. The only
 * difference from the standard canvas will be the "installPattern" method of
 * the drawing context.
 */

/**
 * Change the stroking style of the canvas drawing context from a solid line to
 * a pattern (e.g. dashes, dash-dot-dash, etc.)
 *
 * Once you've installed the pattern, you can draw with it by using the
 * beginPath(), moveTo(), lineTo() and stroke() method calls. Note that some
 * more advanced methods (e.g. quadraticCurveTo() and bezierCurveTo()) are not
 * supported. See file overview for a working example.
 *
 * Side effects of calling this method include adding an "isPatternInstalled"
 * property and "uninstallPattern" method to this particular canvas context.
 * You must call uninstallPattern() before calling installPattern() again.
 *
 * @param {Array.<number>} pattern A description of the stroke pattern. Even
 * indices indicate a draw and odd indices indicate a gap (in pixels). The
 * array should have a even length as any odd lengthed array could be expressed
 * as a smaller even length array.
 */
CanvasRenderingContext2D.prototype.installPattern = function(pattern) {
  "use strict";

  if (typeof(this.isPatternInstalled) !== 'undefined') {
    throw "Must un-install old line pattern before installing a new one.";
  }
  this.isPatternInstalled = true;

  var dashedLineToHistory = [0, 0];

  // list of connected line segements:
  // [ [x1, y1], ..., [xn, yn] ], [ [x1, y1], ..., [xn, yn] ]
  var segments = [];

  // Stash away copies of the unmodified line-drawing functions.
  var realBeginPath = this.beginPath;
  var realLineTo = this.lineTo;
  var realMoveTo = this.moveTo;
  var realStroke = this.stroke;

  /** @type {function()|undefined} */
  this.uninstallPattern = function() {
    this.beginPath = realBeginPath;
    this.lineTo = realLineTo;
    this.moveTo = realMoveTo;
    this.stroke = realStroke;
    this.uninstallPattern = undefined;
    this.isPatternInstalled = undefined;
  };

  // Keep our own copies of the line segments as they're drawn.
  this.beginPath = function() {
    segments = [];
    realBeginPath.call(this);
  };
  this.moveTo = function(x, y) {
    segments.push([[x, y]]);
    realMoveTo.call(this, x, y);
  };
  this.lineTo = function(x, y) {
    var last = segments[segments.length - 1];
    last.push([x, y]);
  };

  this.stroke = function() {
    if (segments.length === 0) {
      // Maybe the user is drawing something other than a line.
      // TODO(danvk): test this case.
      realStroke.call(this);
      return;
    }

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var x1 = seg[0][0], y1 = seg[0][1];
      for (var j = 1; j < seg.length; j++) {
        // Draw a dashed line from (x1, y1) - (x2, y2)
        var x2 = seg[j][0], y2 = seg[j][1];
        this.save();

        // Calculate transformation parameters
        var dx = (x2-x1);
        var dy = (y2-y1);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);

        // Set transformation
        this.translate(x1, y1);
        realMoveTo.call(this, 0, 0);
        this.rotate(rot);

        // Set last pattern index we used for this pattern.
        var patternIndex = dashedLineToHistory[0];
        var x = 0;
        while (len > x) {
          // Get the length of the pattern segment we are dealing with.
          var segment = pattern[patternIndex];
          // If our last draw didn't complete the pattern segment all the way
          // we will try to finish it. Otherwise we will try to do the whole
          // segment.
          if (dashedLineToHistory[1]) {
            x += dashedLineToHistory[1];
          } else {
            x += segment;
          }

          if (x > len) {
            // We were unable to complete this pattern index all the way, keep
            // where we are the history so our next draw continues where we
            // left off in the pattern.
            dashedLineToHistory = [patternIndex, x-len];
            x = len;
          } else {
            // We completed this patternIndex, we put in the history that we
            // are on the beginning of the next segment.
            dashedLineToHistory = [(patternIndex+1)%pattern.length, 0];
          }

          // We do a line on a even pattern index and just move on a odd
          // pattern index.  The move is the empty space in the dash.
          if (patternIndex % 2 === 0) {
            realLineTo.call(this, x, 0);
          } else {
            realMoveTo.call(this, x, 0);
          }

          // If we are not done, next loop process the next pattern segment, or
          // the first segment again if we are at the end of the pattern.
          patternIndex = (patternIndex+1) % pattern.length;
        }

        this.restore();
        x1 = x2, y1 = y2;
      }
    }
    realStroke.call(this);
    segments = [];
  };
};

/**
 * Removes the previously-installed pattern.
 * You must call installPattern() before calling this. You can install at most
 * one pattern at a time--there is no pattern stack.
 */
CanvasRenderingContext2D.prototype.uninstallPattern = function() {
  // This will be replaced by a non-error version when a pattern is installed.
  throw "Must install a line pattern before uninstalling it.";
}

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview DygraphOptions is responsible for parsing and returning information about options.
 *
 * Still tightly coupled to Dygraphs, we could remove some of that, you know.
 */

var DygraphOptions = (function() {

/*jshint sub:true */
/*global Dygraph:false */
"use strict";

/*
 * Interesting member variables: (REMOVING THIS LIST AS I CLOSURIZE)
 * global_ - global attributes (common among all graphs, AIUI)
 * user - attributes set by the user
 * series_ - { seriesName -> { idx, yAxis, options }}
 */

/**
 * This parses attributes into an object that can be easily queried.
 *
 * It doesn't necessarily mean that all options are available, specifically
 * if labels are not yet available, since those drive details of the per-series
 * and per-axis options.
 *
 * @param {Dygraph} dygraph The chart to which these options belong.
 * @constructor
 */
var DygraphOptions = function(dygraph) {
  /**
   * The dygraph.
   * @type {!Dygraph}
   */
  this.dygraph_ = dygraph;

  /**
   * Array of axis index to { series : [ series names ] , options : { axis-specific options. }
   * @type {Array.<{series : Array.<string>, options : Object}>} @private
   */
  this.yAxes_ = [];

  /**
   * Contains x-axis specific options, which are stored in the options key.
   * This matches the yAxes_ object structure (by being a dictionary with an
   * options element) allowing for shared code.
   * @type {options: Object} @private
   */
  this.xAxis_ = {};
  this.series_ = {};

  // Once these two objects are initialized, you can call get();
  this.global_ = this.dygraph_.attrs_;
  this.user_ = this.dygraph_.user_attrs_ || {};

  /**
   * A list of series in columnar order.
   * @type {Array.<string>}
   */
  this.labels_ = [];

  this.highlightSeries_ = this.get("highlightSeriesOpts") || {};
  this.reparseSeries();
};

/**
 * Not optimal, but does the trick when you're only using two axes.
 * If we move to more axes, this can just become a function.
 *
 * @type {Object.<number>}
 * @private
 */
DygraphOptions.AXIS_STRING_MAPPINGS_ = {
  'y' : 0,
  'Y' : 0,
  'y1' : 0,
  'Y1' : 0,
  'y2' : 1,
  'Y2' : 1
};

/**
 * @param {string|number} axis
 * @private
 */
DygraphOptions.axisToIndex_ = function(axis) {
  if (typeof(axis) == "string") {
    if (DygraphOptions.AXIS_STRING_MAPPINGS_.hasOwnProperty(axis)) {
      return DygraphOptions.AXIS_STRING_MAPPINGS_[axis];
    }
    throw "Unknown axis : " + axis;
  }
  if (typeof(axis) == "number") {
    if (axis === 0 || axis === 1) {
      return axis;
    }
    throw "Dygraphs only supports two y-axes, indexed from 0-1.";
  }
  if (axis) {
    throw "Unknown axis : " + axis;
  }
  // No axis specification means axis 0.
  return 0;
};

/**
 * Reparses options that are all related to series. This typically occurs when
 * options are either updated, or source data has been made available.
 *
 * TODO(konigsberg): The method name is kind of weak; fix.
 */
DygraphOptions.prototype.reparseSeries = function() {
  var labels = this.get("labels");
  if (!labels) {
    return; // -- can't do more for now, will parse after getting the labels.
  }

  this.labels_ = labels.slice(1);

  this.yAxes_ = [ { series : [], options : {}} ]; // Always one axis at least.
  this.xAxis_ = { options : {} };
  this.series_ = {};

  // Traditionally, per-series options were specified right up there with the options. For instance
  // {
  //   labels: [ "X", "foo", "bar" ],
  //   pointSize: 3,
  //   foo : {}, // options for foo
  //   bar : {} // options for bar
  // }
  //
  // Moving forward, series really should be specified in the series element, separating them.
  // like so:
  //
  // {
  //   labels: [ "X", "foo", "bar" ],
  //   pointSize: 3,
  //   series : {
  //     foo : {}, // options for foo
  //     bar : {} // options for bar
  //   }
  // }
  //
  // So, if series is found, it's expected to contain per-series data, otherwise we fall
  // back.
  var oldStyleSeries = !this.user_["series"];

  if (oldStyleSeries) {
    var axisId = 0; // 0-offset; there's always one.
    // Go through once, add all the series, and for those with {} axis options, add a new axis.
    for (var idx = 0; idx < this.labels_.length; idx++) {
      var seriesName = this.labels_[idx];

      var optionsForSeries = this.user_[seriesName] || {};

      var yAxis = 0;
      var axis = optionsForSeries["axis"];
      if (typeof(axis) == 'object') {
        yAxis = ++axisId;
        this.yAxes_[yAxis] = { series : [ seriesName ], options : axis };
      }

      // Associate series without axis options with axis 0.
      if (!axis) { // undefined
        this.yAxes_[0].series.push(seriesName);
      }

      this.series_[seriesName] = { idx: idx, yAxis: yAxis, options : optionsForSeries };
    }

    // Go through one more time and assign series to an axis defined by another
    // series, e.g. { 'Y1: { axis: {} }, 'Y2': { axis: 'Y1' } }
    for (var idx = 0; idx < this.labels_.length; idx++) {
      var seriesName = this.labels_[idx];
      var optionsForSeries = this.series_[seriesName]["options"];
      var axis = optionsForSeries["axis"];

      if (typeof(axis) == 'string') {
        if (!this.series_.hasOwnProperty(axis)) {
          Dygraph.error("Series " + seriesName + " wants to share a y-axis with " +
                     "series " + axis + ", which does not define its own axis.");
          return;
        }
        var yAxis = this.series_[axis].yAxis;
        this.series_[seriesName].yAxis = yAxis;
        this.yAxes_[yAxis].series.push(seriesName);
      }
    }
  } else {
    for (var idx = 0; idx < this.labels_.length; idx++) {
      var seriesName = this.labels_[idx];
      var optionsForSeries = this.user_.series[seriesName] || {};
      var yAxis = DygraphOptions.axisToIndex_(optionsForSeries["axis"]);

      this.series_[seriesName] = {
        idx: idx,
        yAxis: yAxis,
        options : optionsForSeries };

      if (!this.yAxes_[yAxis]) {
        this.yAxes_[yAxis] =  { series : [ seriesName ], options : {} };
      } else {
        this.yAxes_[yAxis].series.push(seriesName);
      }
    }
  }

  var axis_opts = this.user_["axes"] || {};
  Dygraph.update(this.yAxes_[0].options, axis_opts["y"] || {});
  if (this.yAxes_.length > 1) {
    Dygraph.update(this.yAxes_[1].options, axis_opts["y2"] || {});
  }
  Dygraph.update(this.xAxis_.options, axis_opts["x"] || {});
};

/**
 * Get a global value.
 *
 * @param {string} name the name of the option.
 */
DygraphOptions.prototype.get = function(name) {
  var result = this.getGlobalUser_(name);
  if (result !== null) {
    return result;
  }
  return this.getGlobalDefault_(name);
};

DygraphOptions.prototype.getGlobalUser_ = function(name) {
  if (this.user_.hasOwnProperty(name)) {
    return this.user_[name];
  }
  return null;
};

DygraphOptions.prototype.getGlobalDefault_ = function(name) {
  if (this.global_.hasOwnProperty(name)) {
    return this.global_[name];
  }
  if (Dygraph.DEFAULT_ATTRS.hasOwnProperty(name)) {
    return Dygraph.DEFAULT_ATTRS[name];
  }
  return null;
};

/**
 * Get a value for a specific axis. If there is no specific value for the axis,
 * the global value is returned.
 *
 * @param {string} name the name of the option.
 * @param {string|number} axis the axis to search. Can be the string representation
 * ("y", "y2") or the axis number (0, 1).
 */
DygraphOptions.prototype.getForAxis = function(name, axis) {
  var axisIdx;
  var axisString;

  // Since axis can be a number or a string, straighten everything out here.
  if (typeof(axis) == 'number') {
    axisIdx = axis;
    axisString = axisIdx === 0 ? "y" : "y2";
  } else {
    if (axis == "y1") { axis = "y"; } // Standardize on 'y'. Is this bad? I think so.
    if (axis == "y") {
      axisIdx = 0;
    } else if (axis == "y2") {
      axisIdx = 1;
    } else if (axis == "x") {
      axisIdx = -1; // simply a placeholder for below.
    } else {
      throw "Unknown axis " + axis;
    }
    axisString = axis;
  }

  var userAxis = (axisIdx == -1) ? this.xAxis_ : this.yAxes_[axisIdx];

  // Search the user-specified axis option first.
  if (userAxis) { // This condition could be removed if we always set up this.yAxes_ for y2.
    var axisOptions = userAxis.options;
    if (axisOptions.hasOwnProperty(name)) {
      return axisOptions[name];
    }
  }

  // User-specified global options second.
  var result = this.getGlobalUser_(name);
  if (result !== null) {
    return result;
  }

  // Default axis options third.
  var defaultAxisOptions = Dygraph.DEFAULT_ATTRS.axes[axisString];
  if (defaultAxisOptions.hasOwnProperty(name)) {
    return defaultAxisOptions[name];
  }

  // Default global options last.
  return this.getGlobalDefault_(name);
};

/**
 * Get a value for a specific series. If there is no specific value for the series,
 * the value for the axis is returned (and afterwards, the global value.)
 *
 * @param {string} name the name of the option.
 * @param {string} series the series to search.
 */
DygraphOptions.prototype.getForSeries = function(name, series) {
  // Honors indexes as series.
  if (series === this.dygraph_.getHighlightSeries()) {
    if (this.highlightSeries_.hasOwnProperty(name)) {
      return this.highlightSeries_[name];
    }
  }

  if (!this.series_.hasOwnProperty(series)) {
    throw "Unknown series: " + series;
  }

  var seriesObj = this.series_[series];
  var seriesOptions = seriesObj["options"];
  if (seriesOptions.hasOwnProperty(name)) {
    return seriesOptions[name];
  }

  return this.getForAxis(name, seriesObj["yAxis"]);
};

/**
 * Returns the number of y-axes on the chart.
 * @return {number} the number of axes.
 */
DygraphOptions.prototype.numAxes = function() {
  return this.yAxes_.length;
};

/**
 * Return the y-axis for a given series, specified by name.
 */
DygraphOptions.prototype.axisForSeries = function(series) {
  return this.series_[series].yAxis;
};

/**
 * Returns the options for the specified axis.
 */
// TODO(konigsberg): this is y-axis specific. Support the x axis.
DygraphOptions.prototype.axisOptions = function(yAxis) {
  return this.yAxes_[yAxis].options;
};

/**
 * Return the series associated with an axis.
 */
DygraphOptions.prototype.seriesForAxis = function(yAxis) {
  return this.yAxes_[yAxis].series;
};

/**
 * Return the list of all series, in their columnar order.
 */
DygraphOptions.prototype.seriesNames = function() {
  return this.labels_;
};

return DygraphOptions;

})();

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview Based on PlotKitLayout, but modified to meet the needs of
 * dygraphs.
 */

/*jshint globalstrict: true */
/*global Dygraph:false */
"use strict";

/**
 * Creates a new DygraphLayout object.
 *
 * This class contains all the data to be charted.
 * It uses data coordinates, but also records the chart range (in data
 * coordinates) and hence is able to calculate percentage positions ('In this
 * view, Point A lies 25% down the x-axis.')
 *
 * Two things that it does not do are:
 * 1. Record pixel coordinates for anything.
 * 2. (oddly) determine anything about the layout of chart elements.
 *
 * The naming is a vestige of Dygraph's original PlotKit roots.
 *
 * @constructor
 */
var DygraphLayout = function(dygraph) {
  this.dygraph_ = dygraph;
  /**
   * Array of points for each series.
   *
   * [series index][row index in series] = |Point| structure,
   * where series index refers to visible series only, and the
   * point index is for the reduced set of points for the current
   * zoom region (including one point just outside the window).
   * All points in the same row index share the same X value.
   *
   * @type {Array.<Array.<Dygraph.PointType>>}
   */
  this.points = [];
  this.setNames = [];
  this.annotations = [];
  this.yAxes_ = null;

  // TODO(danvk): it's odd that xTicks_ and yTicks_ are inputs, but xticks and
  // yticks are outputs. Clean this up.
  this.xTicks_ = null;
  this.yTicks_ = null;
};

DygraphLayout.prototype.attr_ = function(name) {
  return this.dygraph_.attr_(name);
};

/**
 * Add points for a single series.
 *
 * @param {string} setname Name of the series.
 * @param {Array.<Dygraph.PointType>} set_xy Points for the series.
 */
DygraphLayout.prototype.addDataset = function(setname, set_xy) {
  this.points.push(set_xy);
  this.setNames.push(setname);
};

/**
 * Returns the box which the chart should be drawn in. This is the canvas's
 * box, less space needed for the axis and chart labels.
 *
 * @return {{x: number, y: number, w: number, h: number}}
 */
DygraphLayout.prototype.getPlotArea = function() {
  return this.area_;
};

// Compute the box which the chart should be drawn in. This is the canvas's
// box, less space needed for axis, chart labels, and other plug-ins.
// NOTE: This should only be called by Dygraph.predraw_().
DygraphLayout.prototype.computePlotArea = function() {
  var area = {
    // TODO(danvk): per-axis setting.
    x: 0,
    y: 0
  };

  area.w = this.dygraph_.width_ - area.x - this.attr_('rightGap');
  area.h = this.dygraph_.height_;

  // Let plugins reserve space.
  var e = {
    chart_div: this.dygraph_.graphDiv,
    reserveSpaceLeft: function(px) {
      var r = {
        x: area.x,
        y: area.y,
        w: px,
        h: area.h
      };
      area.x += px;
      area.w -= px;
      return r;
    },
    reserveSpaceRight: function(px) {
      var r = {
        x: area.x + area.w - px,
        y: area.y,
        w: px,
        h: area.h
      };
      area.w -= px;
      return r;
    },
    reserveSpaceTop: function(px) {
      var r = {
        x: area.x,
        y: area.y,
        w: area.w,
        h: px
      };
      area.y += px;
      area.h -= px;
      return r;
    },
    reserveSpaceBottom: function(px) {
      var r = {
        x: area.x,
        y: area.y + area.h - px,
        w: area.w,
        h: px
      };
      area.h -= px;
      return r;
    },
    chartRect: function() {
      return {x:area.x, y:area.y, w:area.w, h:area.h};
    }
  };
  this.dygraph_.cascadeEvents_('layout', e);

  this.area_ = area;
};

DygraphLayout.prototype.setAnnotations = function(ann) {
  // The Dygraph object's annotations aren't parsed. We parse them here and
  // save a copy. If there is no parser, then the user must be using raw format.
  this.annotations = [];
  var parse = this.attr_('xValueParser') || function(x) { return x; };
  for (var i = 0; i < ann.length; i++) {
    var a = {};
    if (!ann[i].xval && ann[i].x === undefined) {
      this.dygraph_.error("Annotations must have an 'x' property");
      return;
    }
    if (ann[i].icon &&
        !(ann[i].hasOwnProperty('width') &&
          ann[i].hasOwnProperty('height'))) {
      this.dygraph_.error("Must set width and height when setting " +
                          "annotation.icon property");
      return;
    }
    Dygraph.update(a, ann[i]);
    if (!a.xval) a.xval = parse(a.x);
    this.annotations.push(a);
  }
};

DygraphLayout.prototype.setXTicks = function(xTicks) {
  this.xTicks_ = xTicks;
};

// TODO(danvk): add this to the Dygraph object's API or move it into Layout.
DygraphLayout.prototype.setYAxes = function (yAxes) {
  this.yAxes_ = yAxes;
};

DygraphLayout.prototype.evaluate = function() {
  this._evaluateLimits();
  this._evaluateLineCharts();
  this._evaluateLineTicks();
  this._evaluateAnnotations();
};

DygraphLayout.prototype._evaluateLimits = function() {
  var xlimits = this.dygraph_.xAxisRange();
  this.minxval = xlimits[0];
  this.maxxval = xlimits[1];
  var xrange = xlimits[1] - xlimits[0];
  this.xscale = (xrange !== 0 ? 1 / xrange : 1.0);

  for (var i = 0; i < this.yAxes_.length; i++) {
    var axis = this.yAxes_[i];
    axis.minyval = axis.computedValueRange[0];
    axis.maxyval = axis.computedValueRange[1];
    axis.yrange = axis.maxyval - axis.minyval;
    axis.yscale = (axis.yrange !== 0 ? 1.0 / axis.yrange : 1.0);

    if (axis.g.attr_("logscale")) {
      axis.ylogrange = Dygraph.log10(axis.maxyval) - Dygraph.log10(axis.minyval);
      axis.ylogscale = (axis.ylogrange !== 0 ? 1.0 / axis.ylogrange : 1.0);
      if (!isFinite(axis.ylogrange) || isNaN(axis.ylogrange)) {
        axis.g.error('axis ' + i + ' of graph at ' + axis.g +
            ' can\'t be displayed in log scale for range [' +
            axis.minyval + ' - ' + axis.maxyval + ']');
      }
    }
  }
};

DygraphLayout._calcYNormal = function(axis, value, logscale) {
  if (logscale) {
    return 1.0 - ((Dygraph.log10(value) - Dygraph.log10(axis.minyval)) * axis.ylogscale);
  } else {
    return 1.0 - ((value - axis.minyval) * axis.yscale);
  }
};

DygraphLayout.prototype._evaluateLineCharts = function() {
  var connectSeparated = this.attr_('connectSeparatedPoints');
  var isStacked = this.attr_("stackedGraph");
  var hasBars = this.attr_('errorBars') || this.attr_('customBars');

  for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
    var points = this.points[setIdx];
    var setName = this.setNames[setIdx];
    var axis = this.dygraph_.axisPropertiesForSeries(setName);
    // TODO (konigsberg): use optionsForAxis instead.
    var logscale = this.dygraph_.attributes_.getForSeries("logscale", setName);

    for (var j = 0; j < points.length; j++) {
      var point = points[j];

      // Range from 0-1 where 0 represents left and 1 represents right.
      point.x = (point.xval - this.minxval) * this.xscale;
      // Range from 0-1 where 0 represents top and 1 represents bottom
      var yval = point.yval;
      if (isStacked) {
        point.y_stacked = DygraphLayout._calcYNormal(
            axis, point.yval_stacked, logscale);
        if (yval !== null && !isNaN(yval)) {
          yval = point.yval_stacked;
        }
      }
      if (yval === null) {
        yval = NaN;
        if (!connectSeparated) {
          point.yval = NaN;
        }
      }
      point.y = DygraphLayout._calcYNormal(axis, yval, logscale);

      if (hasBars) {
        point.y_top = DygraphLayout._calcYNormal(
            axis, yval - point.yval_minus, logscale);
        point.y_bottom = DygraphLayout._calcYNormal(
            axis, yval + point.yval_plus, logscale);
      }
    }
  }
};

/**
 * Optimized replacement for parseFloat, which was way too slow when almost
 * all values were type number, with few edge cases, none of which were strings.
 */
DygraphLayout.parseFloat_ = function(val) {
  // parseFloat(null) is NaN
  if (val === null) {
    return NaN;
  }

  // Assume it's a number or NaN. If it's something else, I'll be shocked.
  return val;
};

DygraphLayout.prototype._evaluateLineTicks = function() {
  var i, tick, label, pos;
  this.xticks = [];
  for (i = 0; i < this.xTicks_.length; i++) {
    tick = this.xTicks_[i];
    label = tick.label;
    pos = this.xscale * (tick.v - this.minxval);
    if ((pos >= 0.0) && (pos <= 1.0)) {
      this.xticks.push([pos, label]);
    }
  }

  this.yticks = [];
  for (i = 0; i < this.yAxes_.length; i++ ) {
    var axis = this.yAxes_[i];
    for (var j = 0; j < axis.ticks.length; j++) {
      tick = axis.ticks[j];
      label = tick.label;
      pos = this.dygraph_.toPercentYCoord(tick.v, i);
      if ((pos >= 0.0) && (pos <= 1.0)) {
        this.yticks.push([i, pos, label]);
      }
    }
  }
};

DygraphLayout.prototype._evaluateAnnotations = function() {
  // Add the annotations to the point to which they belong.
  // Make a map from (setName, xval) to annotation for quick lookups.
  var i;
  var annotations = {};
  for (i = 0; i < this.annotations.length; i++) {
    var a = this.annotations[i];
    annotations[a.xval + "," + a.series] = a;
  }

  this.annotated_points = [];

  // Exit the function early if there are no annotations.
  if (!this.annotations || !this.annotations.length) {
    return;
  }

  // TODO(antrob): loop through annotations not points.
  for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
    var points = this.points[setIdx];
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      var k = p.xval + "," + p.name;
      if (k in annotations) {
        p.annotation = annotations[k];
        this.annotated_points.push(p);
      }
    }
  }
};

/**
 * Convenience function to remove all the data sets from a graph
 */
DygraphLayout.prototype.removeAllDatasets = function() {
  delete this.points;
  delete this.setNames;
  delete this.setPointsLengths;
  delete this.setPointsOffsets;
  this.points = [];
  this.setNames = [];
  this.setPointsLengths = [];
  this.setPointsOffsets = [];
};

/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview Based on PlotKit.CanvasRenderer, but modified to meet the
 * needs of dygraphs.
 *
 * In particular, support for:
 * - grid overlays
 * - error bars
 * - dygraphs attribute system
 */

/**
 * The DygraphCanvasRenderer class does the actual rendering of the chart onto
 * a canvas. It's based on PlotKit.CanvasRenderer.
 * @param {Object} element The canvas to attach to
 * @param {Object} elementContext The 2d context of the canvas (injected so it
 * can be mocked for testing.)
 * @param {Layout} layout The DygraphLayout object for this graph.
 * @constructor
 */

/*jshint globalstrict: true */
/*global Dygraph:false,RGBColorParser:false */
"use strict";


/**
 * @constructor
 *
 * This gets called when there are "new points" to chart. This is generally the
 * case when the underlying data being charted has changed. It is _not_ called
 * in the common case that the user has zoomed or is panning the view.
 *
 * The chart canvas has already been created by the Dygraph object. The
 * renderer simply gets a drawing context.
 *
 * @param {Dygraph} dygraph The chart to which this renderer belongs.
 * @param {HTMLCanvasElement} element The &lt;canvas&gt; DOM element on which to draw.
 * @param {CanvasRenderingContext2D} elementContext The drawing context.
 * @param {DygraphLayout} layout The chart's DygraphLayout object.
 *
 * TODO(danvk): remove the elementContext property.
 */
var DygraphCanvasRenderer = function(dygraph, element, elementContext, layout) {
  this.dygraph_ = dygraph;

  this.layout = layout;
  this.element = element;
  this.elementContext = elementContext;
  this.container = this.element.parentNode;

  this.height = this.element.height;
  this.width = this.element.width;

  // --- check whether everything is ok before we return
  // NOTE(konigsberg): isIE is never defined in this object. Bug of some sort.
  if (!this.isIE && !(DygraphCanvasRenderer.isSupported(this.element)))
      throw "Canvas is not supported.";

  // internal state
  this.area = layout.getPlotArea();
  this.container.style.position = "relative";
  this.container.style.width = this.width + "px";

  // Set up a clipping area for the canvas (and the interaction canvas).
  // This ensures that we don't overdraw.
  if (this.dygraph_.isUsingExcanvas_) {
    this._createIEClipArea();
  } else {
    // on Android 3 and 4, setting a clipping area on a canvas prevents it from
    // displaying anything.
    if (!Dygraph.isAndroid()) {
      var ctx = this.dygraph_.canvas_ctx_;
      ctx.beginPath();
      ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
      ctx.clip();

      ctx = this.dygraph_.hidden_ctx_;
      ctx.beginPath();
      ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
      ctx.clip();
    }
  }
};

/**
 * This just forwards to dygraph.attr_.
 * TODO(danvk): remove this?
 * @private
 */
DygraphCanvasRenderer.prototype.attr_ = function(name, opt_seriesName) {
  return this.dygraph_.attr_(name, opt_seriesName);
};

/**
 * Clears out all chart content and DOM elements.
 * This is called immediately before render() on every frame, including
 * during zooms and pans.
 * @private
 */
DygraphCanvasRenderer.prototype.clear = function() {
  var context;
  if (this.isIE) {
    // VML takes a while to start up, so we just poll every this.IEDelay
    try {
      if (this.clearDelay) {
        this.clearDelay.cancel();
        this.clearDelay = null;
      }
      context = this.elementContext;
    }
    catch (e) {
      // TODO(danvk): this is broken, since MochiKit.Async is gone.
      // this.clearDelay = MochiKit.Async.wait(this.IEDelay);
      // this.clearDelay.addCallback(bind(this.clear, this));
      return;
    }
  }

  context = this.elementContext;
  context.clearRect(0, 0, this.width, this.height);
};

/**
 * Checks whether the browser supports the &lt;canvas&gt; tag.
 * @private
 */
DygraphCanvasRenderer.isSupported = function(canvasName) {
  var canvas = null;
  try {
    if (typeof(canvasName) == 'undefined' || canvasName === null) {
      canvas = document.createElement("canvas");
    } else {
      canvas = canvasName;
    }
    canvas.getContext("2d");
  }
  catch (e) {
    var ie = navigator.appVersion.match(/MSIE (\d\.\d)/);
    var opera = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
    if ((!ie) || (ie[1] < 6) || (opera))
      return false;
    return true;
  }
  return true;
};

/**
 * This method is responsible for drawing everything on the chart, including
 * lines, error bars, fills and axes.
 * It is called immediately after clear() on every frame, including during pans
 * and zooms.
 * @private
 */
DygraphCanvasRenderer.prototype.render = function() {
  // attaches point.canvas{x,y}
  this._updatePoints();

  // actually draws the chart.
  this._renderLineChart();
};

DygraphCanvasRenderer.prototype._createIEClipArea = function() {
  var className = 'dygraph-clip-div';
  var graphDiv = this.dygraph_.graphDiv;

  // Remove old clip divs.
  for (var i = graphDiv.childNodes.length-1; i >= 0; i--) {
    if (graphDiv.childNodes[i].className == className) {
      graphDiv.removeChild(graphDiv.childNodes[i]);
    }
  }

  // Determine background color to give clip divs.
  var backgroundColor = document.bgColor;
  var element = this.dygraph_.graphDiv;
  while (element != document) {
    var bgcolor = element.currentStyle.backgroundColor;
    if (bgcolor && bgcolor != 'transparent') {
      backgroundColor = bgcolor;
      break;
    }
    element = element.parentNode;
  }

  function createClipDiv(area) {
    if (area.w === 0 || area.h === 0) {
      return;
    }
    var elem = document.createElement('div');
    elem.className = className;
    elem.style.backgroundColor = backgroundColor;
    elem.style.position = 'absolute';
    elem.style.left = area.x + 'px';
    elem.style.top = area.y + 'px';
    elem.style.width = area.w + 'px';
    elem.style.height = area.h + 'px';
    graphDiv.appendChild(elem);
  }

  var plotArea = this.area;
  // Left side
  createClipDiv({
    x:0, y:0,
    w:plotArea.x,
    h:this.height
  });

  // Top
  createClipDiv({
    x: plotArea.x, y: 0,
    w: this.width - plotArea.x,
    h: plotArea.y
  });

  // Right side
  createClipDiv({
    x: plotArea.x + plotArea.w, y: 0,
    w: this.width-plotArea.x - plotArea.w,
    h: this.height
  });

  // Bottom
  createClipDiv({
    x: plotArea.x,
    y: plotArea.y + plotArea.h,
    w: this.width - plotArea.x,
    h: this.height - plotArea.h - plotArea.y
  });
};


/**
 * Returns a predicate to be used with an iterator, which will
 * iterate over points appropriately, depending on whether
 * connectSeparatedPoints is true. When it's false, the predicate will
 * skip over points with missing yVals.
 */
DygraphCanvasRenderer._getIteratorPredicate = function(connectSeparatedPoints) {
  return connectSeparatedPoints ?
      DygraphCanvasRenderer._predicateThatSkipsEmptyPoints :
      null;
};

DygraphCanvasRenderer._predicateThatSkipsEmptyPoints =
    function(array, idx) {
  return array[idx].yval !== null;
};

/**
 * Draws a line with the styles passed in and calls all the drawPointCallbacks.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawStyledLine = function(e,
    color, strokeWidth, strokePattern, drawPoints,
    drawPointCallback, pointSize) {
  var g = e.dygraph;
  // TODO(konigsberg): Compute attributes outside this method call.
  var stepPlot = g.getOption("stepPlot", e.setName);

  if (!Dygraph.isArrayLike(strokePattern)) {
    strokePattern = null;
  }

  var drawGapPoints = g.getOption('drawGapEdgePoints', e.setName);

  var points = e.points;
  var iter = Dygraph.createIterator(points, 0, points.length,
      DygraphCanvasRenderer._getIteratorPredicate(
          g.getOption("connectSeparatedPoints")));  // TODO(danvk): per-series?

  var stroking = strokePattern && (strokePattern.length >= 2);

  var ctx = e.drawingContext;
  ctx.save();
  if (stroking) {
    ctx.installPattern(strokePattern);
  }

  var pointsOnLine = DygraphCanvasRenderer._drawSeries(
      e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color);
  DygraphCanvasRenderer._drawPointsOnLine(
      e, pointsOnLine, drawPointCallback, color, pointSize);

  if (stroking) {
    ctx.uninstallPattern();
  }

  ctx.restore();
};

/**
 * This does the actual drawing of lines on the canvas, for just one series.
 * Returns a list of [canvasx, canvasy] pairs for points for which a
 * drawPointCallback should be fired.  These include isolated points, or all
 * points if drawPoints=true.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawSeries = function(e,
    iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color) {

  var prevCanvasX = null;
  var prevCanvasY = null;
  var nextCanvasY = null;
  var isIsolated; // true if this point is isolated (no line segments)
  var point; // the point being processed in the while loop
  var pointsOnLine = []; // Array of [canvasx, canvasy] pairs.
  var first = true; // the first cycle through the while loop

  var ctx = e.drawingContext;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;

  // NOTE: we break the iterator's encapsulation here for about a 25% speedup.
  var arr = iter.array_;
  var limit = iter.end_;
  var predicate = iter.predicate_;

  for (var i = iter.start_; i < limit; i++) {
    point = arr[i];
    if (predicate) {
      while (i < limit && !predicate(arr, i)) {
        i++;
      }
      if (i == limit) break;
      point = arr[i];
    }

    if (point.canvasy === null || point.canvasy != point.canvasy) {
      if (stepPlot && prevCanvasX !== null) {
        // Draw a horizontal line to the start of the missing data
        ctx.moveTo(prevCanvasX, prevCanvasY);
        ctx.lineTo(point.canvasx, prevCanvasY);
      }
      prevCanvasX = prevCanvasY = null;
    } else {
      isIsolated = false;
      if (drawGapPoints || !prevCanvasX) {
        iter.nextIdx_ = i;
        iter.next();
        nextCanvasY = iter.hasNext ? iter.peek.canvasy : null;

        var isNextCanvasYNullOrNaN = nextCanvasY === null ||
            nextCanvasY != nextCanvasY;
        isIsolated = (!prevCanvasX && isNextCanvasYNullOrNaN);
        if (drawGapPoints) {
          // Also consider a point to be "isolated" if it's adjacent to a
          // null point, excluding the graph edges.
          if ((!first && !prevCanvasX) ||
              (iter.hasNext && isNextCanvasYNullOrNaN)) {
            isIsolated = true;
          }
        }
      }

      if (prevCanvasX !== null) {
        if (strokeWidth) {
          if (stepPlot) {
            ctx.moveTo(prevCanvasX, prevCanvasY);
            ctx.lineTo(point.canvasx, prevCanvasY);
          }

          ctx.lineTo(point.canvasx, point.canvasy);
        }
      } else {
        ctx.moveTo(point.canvasx, point.canvasy);
      }
      if (drawPoints || isIsolated) {
        pointsOnLine.push([point.canvasx, point.canvasy, point.idx]);
      }
      prevCanvasX = point.canvasx;
      prevCanvasY = point.canvasy;
    }
    first = false;
  }
  ctx.stroke();
  return pointsOnLine;
};

/**
 * This fires the drawPointCallback functions, which draw dots on the points by
 * default. This gets used when the "drawPoints" option is set, or when there
 * are isolated points.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawPointsOnLine = function(
    e, pointsOnLine, drawPointCallback, color, pointSize) {
  var ctx = e.drawingContext;
  for (var idx = 0; idx < pointsOnLine.length; idx++) {
    var cb = pointsOnLine[idx];
    ctx.save();
    drawPointCallback(
        e.dygraph, e.setName, ctx, cb[0], cb[1], color, pointSize, cb[2]);
    ctx.restore();
  }
};

/**
 * Attaches canvas coordinates to the points array.
 * @private
 */
DygraphCanvasRenderer.prototype._updatePoints = function() {
  // Update Points
  // TODO(danvk): here
  //
  // TODO(bhs): this loop is a hot-spot for high-point-count charts. These
  // transformations can be pushed into the canvas via linear transformation
  // matrices.
  // NOTE(danvk): this is trickier than it sounds at first. The transformation
  // needs to be done before the .moveTo() and .lineTo() calls, but must be
  // undone before the .stroke() call to ensure that the stroke width is
  // unaffected.  An alternative is to reduce the stroke width in the
  // transformed coordinate space, but you can't specify different values for
  // each dimension (as you can with .scale()). The speedup here is ~12%.
  var sets = this.layout.points;
  for (var i = sets.length; i--;) {
    var points = sets[i];
    for (var j = points.length; j--;) {
      var point = points[j];
      point.canvasx = this.area.w * point.x + this.area.x;
      point.canvasy = this.area.h * point.y + this.area.y;
    }
  }
};

/**
 * Add canvas Actually draw the lines chart, including error bars.
 *
 * This function can only be called if DygraphLayout's points array has been
 * updated with canvas{x,y} attributes, i.e. by
 * DygraphCanvasRenderer._updatePoints.
 *
 * @param {string=} opt_seriesName when specified, only that series will
 *     be drawn. (This is used for expedited redrawing with highlightSeriesOpts)
 * @param {CanvasRenderingContext2D} opt_ctx when specified, the drawing
 *     context.  However, lines are typically drawn on the object's
 *     elementContext.
 * @private
 */
DygraphCanvasRenderer.prototype._renderLineChart = function(opt_seriesName, opt_ctx) {
  var ctx = opt_ctx || this.elementContext;
  var i;

  var sets = this.layout.points;
  var setNames = this.layout.setNames;
  var setName;

  this.colors = this.dygraph_.colorsMap_;

  // Determine which series have specialized plotters.
  var plotter_attr = this.attr_("plotter");
  var plotters = plotter_attr;
  if (!Dygraph.isArrayLike(plotters)) {
    plotters = [plotters];
  }

  var setPlotters = {};  // series name -> plotter fn.
  for (i = 0; i < setNames.length; i++) {
    setName = setNames[i];
    var setPlotter = this.attr_("plotter", setName);
    if (setPlotter == plotter_attr) continue;  // not specialized.

    setPlotters[setName] = setPlotter;
  }

  for (i = 0; i < plotters.length; i++) {
    var plotter = plotters[i];
    var is_last = (i == plotters.length - 1);

    for (var j = 0; j < sets.length; j++) {
      setName = setNames[j];
      if (opt_seriesName && setName != opt_seriesName) continue;

      var points = sets[j];

      // Only throw in the specialized plotters on the last iteration.
      var p = plotter;
      if (setName in setPlotters) {
        if (is_last) {
          p = setPlotters[setName];
        } else {
          // Don't use the standard plotters in this case.
          continue;
        }
      }

      var color = this.colors[setName];
      var strokeWidth = this.dygraph_.getOption("strokeWidth", setName);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      p({
        points: points,
        setName: setName,
        drawingContext: ctx,
        color: color,
        strokeWidth: strokeWidth,
        dygraph: this.dygraph_,
        axis: this.dygraph_.axisPropertiesForSeries(setName),
        plotArea: this.area,
        seriesIndex: j,
        seriesCount: sets.length,
        singleSeriesName: opt_seriesName,
        allSeriesPoints: sets
      });
      ctx.restore();
    }
  }
};

/**
 * Standard plotters. These may be used by clients via Dygraph.Plotters.
 * See comments there for more details.
 */
DygraphCanvasRenderer._Plotters = {
  linePlotter: function(e) {
    DygraphCanvasRenderer._linePlotter(e);
  },

  fillPlotter: function(e) {
    DygraphCanvasRenderer._fillPlotter(e);
  },

  errorPlotter: function(e) {
    DygraphCanvasRenderer._errorPlotter(e);
  }
};

/**
 * Plotter which draws the central lines for a series.
 * @private
 */
DygraphCanvasRenderer._linePlotter = function(e) {
  var g = e.dygraph;
  var setName = e.setName;
  var strokeWidth = e.strokeWidth;

  // TODO(danvk): Check if there's any performance impact of just calling
  // getOption() inside of _drawStyledLine. Passing in so many parameters makes
  // this code a bit nasty.
  var borderWidth = g.getOption("strokeBorderWidth", setName);
  var drawPointCallback = g.getOption("drawPointCallback", setName) ||
      Dygraph.Circles.DEFAULT;
  var strokePattern = g.getOption("strokePattern", setName);
  var drawPoints = g.getOption("drawPoints", setName);
  var pointSize = g.getOption("pointSize", setName);

  if (borderWidth && strokeWidth) {
    DygraphCanvasRenderer._drawStyledLine(e,
        g.getOption("strokeBorderColor", setName),
        strokeWidth + 2 * borderWidth,
        strokePattern,
        drawPoints,
        drawPointCallback,
        pointSize
        );
  }

  DygraphCanvasRenderer._drawStyledLine(e,
      e.color,
      strokeWidth,
      strokePattern,
      drawPoints,
      drawPointCallback,
      pointSize
  );
};

/**
 * Draws the shaded error bars/confidence intervals for each series.
 * This happens before the center lines are drawn, since the center lines
 * need to be drawn on top of the error bars for all series.
 * @private
 */
DygraphCanvasRenderer._errorPlotter = function(e) {
  var g = e.dygraph;
  var setName = e.setName;
  var errorBars = g.getOption("errorBars") || g.getOption("customBars");
  if (!errorBars) return;

  var fillGraph = g.getOption("fillGraph", setName);
  if (fillGraph) {
    g.warn("Can't use fillGraph option with error bars");
  }

  var ctx = e.drawingContext;
  var color = e.color;
  var fillAlpha = g.getOption('fillAlpha', setName);
  var stepPlot = g.getOption("stepPlot", setName);
  var points = e.points;

  var iter = Dygraph.createIterator(points, 0, points.length,
      DygraphCanvasRenderer._getIteratorPredicate(
          g.getOption("connectSeparatedPoints")));

  var newYs;

  // setup graphics context
  var prevX = NaN;
  var prevY = NaN;
  var prevYs = [-1, -1];
  // should be same color as the lines but only 15% opaque.
  var rgb = new RGBColorParser(color);
  var err_color =
      'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
  ctx.fillStyle = err_color;
  ctx.beginPath();

  var isNullUndefinedOrNaN = function(x) {
    return (x === null ||
            x === undefined ||
            isNaN(x));
  };

  while (iter.hasNext) {
    var point = iter.next();
    if ((!stepPlot && isNullUndefinedOrNaN(point.y)) ||
        (stepPlot && !isNaN(prevY) && isNullUndefinedOrNaN(prevY))) {
      prevX = NaN;
      continue;
    }

    if (stepPlot) {
      newYs = [ point.y_bottom, point.y_top ];
      prevY = point.y;
    } else {
      newYs = [ point.y_bottom, point.y_top ];
    }
    newYs[0] = e.plotArea.h * newYs[0] + e.plotArea.y;
    newYs[1] = e.plotArea.h * newYs[1] + e.plotArea.y;
    if (!isNaN(prevX)) {
      if (stepPlot) {
        ctx.moveTo(prevX, prevYs[0]);
        ctx.lineTo(point.canvasx, prevYs[0]);
        ctx.lineTo(point.canvasx, prevYs[1]);
      } else {
        ctx.moveTo(prevX, prevYs[0]);
        ctx.lineTo(point.canvasx, newYs[0]);
        ctx.lineTo(point.canvasx, newYs[1]);
      }
      ctx.lineTo(prevX, prevYs[1]);
      ctx.closePath();
    }
    prevYs = newYs;
    prevX = point.canvasx;
  }
  ctx.fill();
};

/**
 * Draws the shaded regions when "fillGraph" is set. Not to be confused with
 * error bars.
 *
 * For stacked charts, it's more convenient to handle all the series
 * simultaneously. So this plotter plots all the points on the first series
 * it's asked to draw, then ignores all the other series.
 *
 * @private
 */
DygraphCanvasRenderer._fillPlotter = function(e) {
  // Skip if we're drawing a single series for interactive highlight overlay.
  if (e.singleSeriesName) return;

  // We'll handle all the series at once, not one-by-one.
  if (e.seriesIndex !== 0) return;

  var g = e.dygraph;
  var setNames = g.getLabels().slice(1);  // remove x-axis

  // getLabels() includes names for invisible series, which are not included in
  // allSeriesPoints. We remove those to make the two match.
  // TODO(danvk): provide a simpler way to get this information.
  for (var i = setNames.length; i >= 0; i--) {
    if (!g.visibility()[i]) setNames.splice(i, 1);
  }

  var anySeriesFilled = (function() {
    for (var i = 0; i < setNames.length; i++) {
      if (g.getOption("fillGraph", setNames[i])) return true;
    }
    return false;
  })();

  if (!anySeriesFilled) return;

  var ctx = e.drawingContext;
  var area = e.plotArea;
  var sets = e.allSeriesPoints;
  var setCount = sets.length;

  var fillAlpha = g.getOption('fillAlpha');
  var stackedGraph = g.getOption("stackedGraph");
  var colors = g.getColors();

  // For stacked graphs, track the baseline for filling.
  //
  // The filled areas below graph lines are trapezoids with two
  // vertical edges. The top edge is the line segment being drawn, and
  // the baseline is the bottom edge. Each baseline corresponds to the
  // top line segment from the previous stacked line. In the case of
  // step plots, the trapezoids are rectangles.
  var baseline = {};
  var currBaseline;
  var prevStepPlot;  // for different line drawing modes (line/step) per series

  // process sets in reverse order (needed for stacked graphs)
  for (var setIdx = setCount - 1; setIdx >= 0; setIdx--) {
    var setName = setNames[setIdx];
    if (!g.getOption('fillGraph', setName)) continue;
    
    var stepPlot = g.getOption('stepPlot', setName);
    var color = colors[setIdx];
    var axis = g.axisPropertiesForSeries(setName);
    var axisY = 1.0 + axis.minyval * axis.yscale;
    if (axisY < 0.0) axisY = 0.0;
    else if (axisY > 1.0) axisY = 1.0;
    axisY = area.h * axisY + area.y;

    var points = sets[setIdx];
    var iter = Dygraph.createIterator(points, 0, points.length,
        DygraphCanvasRenderer._getIteratorPredicate(
            g.getOption("connectSeparatedPoints")));

    // setup graphics context
    var prevX = NaN;
    var prevYs = [-1, -1];
    var newYs;
    // should be same color as the lines but only 15% opaque.
    var rgb = new RGBColorParser(color);
    var err_color =
        'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
    ctx.fillStyle = err_color;
    ctx.beginPath();
    var last_x, is_first = true;
    while (iter.hasNext) {
      var point = iter.next();
      if (!Dygraph.isOK(point.y)) {
        prevX = NaN;
        if (point.y_stacked !== null && !isNaN(point.y_stacked)) {
          baseline[point.canvasx] = area.h * point.y_stacked + area.y;
        }
        continue;
      }
      if (stackedGraph) {
        if (!is_first && last_x == point.xval) {
          continue;
        } else {
          is_first = false;
          last_x = point.xval;
        }

        currBaseline = baseline[point.canvasx];
        var lastY;
        if (currBaseline === undefined) {
          lastY = axisY;
        } else {
          if(prevStepPlot) {
            lastY = currBaseline[0];
          } else {
            lastY = currBaseline;
          }
        }
        newYs = [ point.canvasy, lastY ];

        if(stepPlot) {
          // Step plots must keep track of the top and bottom of
          // the baseline at each point.
          if(prevYs[0] === -1) {
            baseline[point.canvasx] = [ point.canvasy, axisY ];
          } else {
            baseline[point.canvasx] = [ point.canvasy, prevYs[0] ];
          }
        } else {
          baseline[point.canvasx] = point.canvasy;
        }

      } else {
        newYs = [ point.canvasy, axisY ];
      }
      if (!isNaN(prevX)) {
        ctx.moveTo(prevX, prevYs[0]);
        
        // Move to top fill point
        if (stepPlot) {
          ctx.lineTo(point.canvasx, prevYs[0]);
        } else {
          ctx.lineTo(point.canvasx, newYs[0]);
        }
        // Move to bottom fill point
        if (prevStepPlot && currBaseline) {
          // Draw to the bottom of the baseline
          ctx.lineTo(point.canvasx, currBaseline[1]);
        } else {
          ctx.lineTo(point.canvasx, newYs[1]);
        }

        ctx.lineTo(prevX, prevYs[1]);
        ctx.closePath();
      }
      prevYs = newYs;
      prevX = point.canvasx;
    }
    prevStepPlot = stepPlot;
    ctx.fill();
  }
};

/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview Creates an interactive, zoomable graph based on a CSV file or
 * string. Dygraph can handle multiple series with or without error bars. The
 * date/value ranges will be automatically set. Dygraph uses the
 * &lt;canvas&gt; tag, so it only works in FF1.5+.
 * @author danvdk@gmail.com (Dan Vanderkam)

  Usage:
   <div id="graphdiv" style="width:800px; height:500px;"></div>
   <script type="text/javascript">
     new Dygraph(document.getElementById("graphdiv"),
                 "datafile.csv",  // CSV file with headers
                 { }); // options
   </script>

 The CSV file is of the form

   Date,SeriesA,SeriesB,SeriesC
   YYYYMMDD,A1,B1,C1
   YYYYMMDD,A2,B2,C2

 If the 'errorBars' option is set in the constructor, the input should be of
 the form
   Date,SeriesA,SeriesB,...
   YYYYMMDD,A1,sigmaA1,B1,sigmaB1,...
   YYYYMMDD,A2,sigmaA2,B2,sigmaB2,...

 If the 'fractions' option is set, the input should be of the form:

   Date,SeriesA,SeriesB,...
   YYYYMMDD,A1/B1,A2/B2,...
   YYYYMMDD,A1/B1,A2/B2,...

 And error bars will be calculated automatically using a binomial distribution.

 For further documentation and examples, see http://dygraphs.com/

 */

/*jshint globalstrict: true */
/*global DygraphLayout:false, DygraphCanvasRenderer:false, DygraphOptions:false, G_vmlCanvasManager:false,ActiveXObject:false */
"use strict";

/**
 * Creates an interactive, zoomable chart.
 *
 * @constructor
 * @param {div | String} div A div or the id of a div into which to construct
 * the chart.
 * @param {String | Function} file A file containing CSV data or a function
 * that returns this data. The most basic expected format for each line is
 * "YYYY/MM/DD,val1,val2,...". For more information, see
 * http://dygraphs.com/data.html.
 * @param {Object} attrs Various other attributes, e.g. errorBars determines
 * whether the input data contains error ranges. For a complete list of
 * options, see http://dygraphs.com/options.html.
 */
var Dygraph = function(div, data, opts, opt_fourth_param) {
  // These have to go above the "Hack for IE" in __init__ since .ready() can be
  // called as soon as the constructor returns. Once support for OldIE is
  // dropped, this can go down with the rest of the initializers.
  this.is_initial_draw_ = true;
  this.readyFns_ = [];

  if (opt_fourth_param !== undefined) {
    // Old versions of dygraphs took in the series labels as a constructor
    // parameter. This doesn't make sense anymore, but it's easy to continue
    // to support this usage.
    this.warn("Using deprecated four-argument dygraph constructor");
    this.__old_init__(div, data, opts, opt_fourth_param);
  } else {
    this.__init__(div, data, opts);
  }
};

Dygraph.NAME = "Dygraph";
Dygraph.VERSION = "1.0.1";
Dygraph.__repr__ = function() {
  return "[" + this.NAME + " " + this.VERSION + "]";
};

/**
 * Returns information about the Dygraph class.
 */
Dygraph.toString = function() {
  return this.__repr__();
};

// Various default values
Dygraph.DEFAULT_ROLL_PERIOD = 1;
Dygraph.DEFAULT_WIDTH = 480;
Dygraph.DEFAULT_HEIGHT = 320;

// For max 60 Hz. animation:
Dygraph.ANIMATION_STEPS = 12;
Dygraph.ANIMATION_DURATION = 200;

// Label constants for the labelsKMB and labelsKMG2 options.
// (i.e. '100000' -> '100K')
Dygraph.KMB_LABELS = [ 'K', 'M', 'B', 'T', 'Q' ];
Dygraph.KMG2_BIG_LABELS = [ 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];
Dygraph.KMG2_SMALL_LABELS = [ 'm', 'u', 'n', 'p', 'f', 'a', 'z', 'y' ];

// These are defined before DEFAULT_ATTRS so that it can refer to them.
/**
 * @private
 * Return a string version of a number. This respects the digitsAfterDecimal
 * and maxNumberWidth options.
 * @param {Number} x The number to be formatted
 * @param {Dygraph} opts An options view
 * @param {String} name The name of the point's data series
 * @param {Dygraph} g The dygraph object
 */
Dygraph.numberValueFormatter = function(x, opts, pt, g) {
  var sigFigs = opts('sigFigs');

  if (sigFigs !== null) {
    // User has opted for a fixed number of significant figures.
    return Dygraph.floatFormat(x, sigFigs);
  }

  var digits = opts('digitsAfterDecimal');
  var maxNumberWidth = opts('maxNumberWidth');

  var kmb = opts('labelsKMB');
  var kmg2 = opts('labelsKMG2');

  var label;

  // switch to scientific notation if we underflow or overflow fixed display.
  if (x !== 0.0 &&
      (Math.abs(x) >= Math.pow(10, maxNumberWidth) ||
       Math.abs(x) < Math.pow(10, -digits))) {
    label = x.toExponential(digits);
  } else {
    label = '' + Dygraph.round_(x, digits);
  }

  if (kmb || kmg2) {
    var k;
    var k_labels = [];
    var m_labels = [];
    if (kmb) {
      k = 1000;
      k_labels = Dygraph.KMB_LABELS;
    }
    if (kmg2) {
      if (kmb) Dygraph.warn("Setting both labelsKMB and labelsKMG2. Pick one!");
      k = 1024;
      k_labels = Dygraph.KMG2_BIG_LABELS;
      m_labels = Dygraph.KMG2_SMALL_LABELS;
    }

    var absx = Math.abs(x);
    var n = Dygraph.pow(k, k_labels.length);
    for (var j = k_labels.length - 1; j >= 0; j--, n /= k) {
      if (absx >= n) {
        label = Dygraph.round_(x / n, digits) + k_labels[j];
        break;
      }
    }
    if (kmg2) {
      // TODO(danvk): clean up this logic. Why so different than kmb?
      var x_parts = String(x.toExponential()).split('e-');
      if (x_parts.length === 2 && x_parts[1] >= 3 && x_parts[1] <= 24) {
        if (x_parts[1] % 3 > 0) {
          label = Dygraph.round_(x_parts[0] /
              Dygraph.pow(10, (x_parts[1] % 3)),
              digits);
        } else {
          label = Number(x_parts[0]).toFixed(2);
        }
        label += m_labels[Math.floor(x_parts[1] / 3) - 1];
      }
    }
  }

  return label;
};

/**
 * variant for use as an axisLabelFormatter.
 * @private
 */
Dygraph.numberAxisLabelFormatter = function(x, granularity, opts, g) {
  return Dygraph.numberValueFormatter(x, opts, g);
};

/**
 * Convert a JS date (millis since epoch) to YYYY/MM/DD
 * @param {Number} date The JavaScript date (ms since epoch)
 * @return {String} A date of the form "YYYY/MM/DD"
 * @private
 */
Dygraph.dateString_ = function(date) {
  var zeropad = Dygraph.zeropad;
  var d = new Date(date);

  // Get the year:
  var year = "" + d.getFullYear();
  // Get a 0 padded month string
  var month = zeropad(d.getMonth() + 1);  //months are 0-offset, sigh
  // Get a 0 padded day string
  var day = zeropad(d.getDate());

  var ret = "";
  var frac = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  if (frac) ret = " " + Dygraph.hmsString_(date);

  return year + "/" + month + "/" + day + ret;
};

/**
 * Convert a JS date to a string appropriate to display on an axis that
 * is displaying values at the stated granularity.
 * @param {Date} date The date to format
 * @param {Number} granularity One of the Dygraph granularity constants
 * @return {String} The formatted date
 * @private
 */
Dygraph.dateAxisFormatter = function(date, granularity) {
  if (granularity >= Dygraph.DECADAL) {
    return date.strftime('%Y');
  } else if (granularity >= Dygraph.MONTHLY) {
    return date.strftime('%b %y');
  } else {
    var frac = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds();
    if (frac === 0 || granularity >= Dygraph.DAILY) {
      return new Date(date.getTime() + 3600*1000).strftime('%d%b');
    } else {
      return Dygraph.hmsString_(date.getTime());
    }
  }
};

/**
 * Standard plotters. These may be used by clients.
 * Available plotters are:
 * - Dygraph.Plotters.linePlotter: draws central lines (most common)
 * - Dygraph.Plotters.errorPlotter: draws error bars
 * - Dygraph.Plotters.fillPlotter: draws fills under lines (used with fillGraph)
 *
 * By default, the plotter is [fillPlotter, errorPlotter, linePlotter].
 * This causes all the lines to be drawn over all the fills/error bars.
 */
Dygraph.Plotters = DygraphCanvasRenderer._Plotters;


// Default attribute values.
Dygraph.DEFAULT_ATTRS = {
  highlightCircleSize: 3,
  highlightSeriesOpts: null,
  highlightSeriesBackgroundAlpha: 0.5,

  labelsDivWidth: 250,
  labelsDivStyles: {
    // TODO(danvk): move defaults from createStatusMessage_ here.
  },
  labelsSeparateLines: false,
  labelsShowZeroValues: true,
  labelsKMB: false,
  labelsKMG2: false,
  showLabelsOnHighlight: true,

  digitsAfterDecimal: 2,
  maxNumberWidth: 6,
  sigFigs: null,

  strokeWidth: 1.0,
  strokeBorderWidth: 0,
  strokeBorderColor: "white",

  axisTickSize: 3,
  axisLabelFontSize: 14,
  xAxisLabelWidth: 50,
  yAxisLabelWidth: 50,
  rightGap: 5,

  showRoller: false,
  xValueParser: Dygraph.dateParser,

  delimiter: ',',

  sigma: 2.0,
  errorBars: false,
  fractions: false,
  wilsonInterval: true,  // only relevant if fractions is true
  customBars: false,
  fillGraph: false,
  fillAlpha: 0.15,
  connectSeparatedPoints: false,

  stackedGraph: false,
  stackedGraphNaNFill: 'all',
  hideOverlayOnMouseOut: true,

  // TODO(danvk): support 'onmouseover' and 'never', and remove synonyms.
  legend: 'onmouseover',  // the only relevant value at the moment is 'always'.

  stepPlot: false,
  avoidMinZero: false,
  xRangePad: 0,
  yRangePad: null,
  drawAxesAtZero: false,

  // Sizes of the various chart labels.
  titleHeight: 28,
  xLabelHeight: 18,
  yLabelWidth: 18,

  drawXAxis: true,
  drawYAxis: true,
  axisLineColor: "black",
  axisLineWidth: 0.3,
  gridLineWidth: 0.3,
  axisLabelColor: "black",
  axisLabelFont: "Arial",  // TODO(danvk): is this implemented?
  axisLabelWidth: 50,
  drawYGrid: true,
  drawXGrid: true,
  gridLineColor: "rgb(128,128,128)",

  interactionModel: null,  // will be set to Dygraph.Interaction.defaultModel
  animatedZooms: false,  // (for now)

  // Range selector options
  showRangeSelector: false,
  rangeSelectorHeight: 40,
  rangeSelectorPlotStrokeColor: "#808FAB",
  rangeSelectorPlotFillColor: "#A7B1C4",

  // The ordering here ensures that central lines always appear above any
  // fill bars/error bars.
  plotter: [
    Dygraph.Plotters.fillPlotter,
    Dygraph.Plotters.errorPlotter,
    Dygraph.Plotters.linePlotter
  ],

  plugins: [ ],

  // per-axis options
  axes: {
    x: {
      pixelsPerLabel: 60,
      axisLabelFormatter: Dygraph.dateAxisFormatter,
      valueFormatter: Dygraph.dateString_,
      drawGrid: true,
      independentTicks: true,
      ticker: null  // will be set in dygraph-tickers.js
    },
    y: {
      pixelsPerLabel: 30,
      valueFormatter: Dygraph.numberValueFormatter,
      axisLabelFormatter: Dygraph.numberAxisLabelFormatter,
      drawGrid: true,
      independentTicks: true,
      ticker: null  // will be set in dygraph-tickers.js
    },
    y2: {
      pixelsPerLabel: 30,
      valueFormatter: Dygraph.numberValueFormatter,
      axisLabelFormatter: Dygraph.numberAxisLabelFormatter,
      drawGrid: false,
      independentTicks: false,
      ticker: null  // will be set in dygraph-tickers.js
    }
  }
};

// Directions for panning and zooming. Use bit operations when combined
// values are possible.
Dygraph.HORIZONTAL = 1;
Dygraph.VERTICAL = 2;

// Installed plugins, in order of precedence (most-general to most-specific).
// Plugins are installed after they are defined, in plugins/install.js.
Dygraph.PLUGINS = [
];

// Used for initializing annotation CSS rules only once.
Dygraph.addedAnnotationCSS = false;

Dygraph.prototype.__old_init__ = function(div, file, labels, attrs) {
  // Labels is no longer a constructor parameter, since it's typically set
  // directly from the data source. It also conains a name for the x-axis,
  // which the previous constructor form did not.
  if (labels !== null) {
    var new_labels = ["Date"];
    for (var i = 0; i < labels.length; i++) new_labels.push(labels[i]);
    Dygraph.update(attrs, { 'labels': new_labels });
  }
  this.__init__(div, file, attrs);
};

/**
 * Initializes the Dygraph. This creates a new DIV and constructs the PlotKit
 * and context &lt;canvas&gt; inside of it. See the constructor for details.
 * on the parameters.
 * @param {Element} div the Element to render the graph into.
 * @param {String | Function} file Source data
 * @param {Object} attrs Miscellaneous other options
 * @private
 */
Dygraph.prototype.__init__ = function(div, file, attrs) {
  // Hack for IE: if we're using excanvas and the document hasn't finished
  // loading yet (and hence may not have initialized whatever it needs to
  // initialize), then keep calling this routine periodically until it has.
  if (/MSIE/.test(navigator.userAgent) && !window.opera &&
      typeof(G_vmlCanvasManager) != 'undefined' &&
      document.readyState != 'complete') {
    var self = this;
    setTimeout(function() { self.__init__(div, file, attrs); }, 100);
    return;
  }

  // Support two-argument constructor
  if (attrs === null || attrs === undefined) { attrs = {}; }

  attrs = Dygraph.mapLegacyOptions_(attrs);

  if (typeof(div) == 'string') {
    div = document.getElementById(div);
  }

  if (!div) {
    Dygraph.error("Constructing dygraph with a non-existent div!");
    return;
  }

  this.isUsingExcanvas_ = typeof(G_vmlCanvasManager) != 'undefined';

  // Copy the important bits into the object
  // TODO(danvk): most of these should just stay in the attrs_ dictionary.
  this.maindiv_ = div;
  this.file_ = file;
  this.rollPeriod_ = attrs.rollPeriod || Dygraph.DEFAULT_ROLL_PERIOD;
  this.previousVerticalX_ = -1;
  this.fractions_ = attrs.fractions || false;
  this.dateWindow_ = attrs.dateWindow || null;

  this.annotations_ = [];

  // Zoomed indicators - These indicate when the graph has been zoomed and on what axis.
  this.zoomed_x_ = false;
  this.zoomed_y_ = false;

  // Clear the div. This ensure that, if multiple dygraphs are passed the same
  // div, then only one will be drawn.
  div.innerHTML = "";

  // For historical reasons, the 'width' and 'height' options trump all CSS
  // rules _except_ for an explicit 'width' or 'height' on the div.
  // As an added convenience, if the div has zero height (like <div></div> does
  // without any styles), then we use a default height/width.
  if (div.style.width === '' && attrs.width) {
    div.style.width = attrs.width + "px";
  }
  if (div.style.height === '' && attrs.height) {
    div.style.height = attrs.height + "px";
  }
  if (div.style.height === '' && div.clientHeight === 0) {
    div.style.height = Dygraph.DEFAULT_HEIGHT + "px";
    if (div.style.width === '') {
      div.style.width = Dygraph.DEFAULT_WIDTH + "px";
    }
  }
  // These will be zero if the dygraph's div is hidden. In that case,
  // use the user-specified attributes if present. If not, use zero
  // and assume the user will call resize to fix things later.
  this.width_ = div.clientWidth || attrs.width || 0;
  this.height_ = div.clientHeight || attrs.height || 0;

  // TODO(danvk): set fillGraph to be part of attrs_ here, not user_attrs_.
  if (attrs.stackedGraph) {
    attrs.fillGraph = true;
    // TODO(nikhilk): Add any other stackedGraph checks here.
  }

  // DEPRECATION WARNING: All option processing should be moved from
  // attrs_ and user_attrs_ to options_, which holds all this information.
  //
  // Dygraphs has many options, some of which interact with one another.
  // To keep track of everything, we maintain two sets of options:
  //
  //  this.user_attrs_   only options explicitly set by the user.
  //  this.attrs_        defaults, options derived from user_attrs_, data.
  //
  // Options are then accessed this.attr_('attr'), which first looks at
  // user_attrs_ and then computed attrs_. This way Dygraphs can set intelligent
  // defaults without overriding behavior that the user specifically asks for.
  this.user_attrs_ = {};
  Dygraph.update(this.user_attrs_, attrs);

  // This sequence ensures that Dygraph.DEFAULT_ATTRS is never modified.
  this.attrs_ = {};
  Dygraph.updateDeep(this.attrs_, Dygraph.DEFAULT_ATTRS);

  this.boundaryIds_ = [];
  this.setIndexByName_ = {};
  this.datasetIndex_ = [];

  this.registeredEvents_ = [];
  this.eventListeners_ = {};

  this.attributes_ = new DygraphOptions(this);

  // Create the containing DIV and other interactive elements
  this.createInterface_();

  // Activate plugins.
  this.plugins_ = [];
  var plugins = Dygraph.PLUGINS.concat(this.getOption('plugins'));
  for (var i = 0; i < plugins.length; i++) {
    var Plugin = plugins[i];
    var pluginInstance = new Plugin();
    var pluginDict = {
      plugin: pluginInstance,
      events: {},
      options: {},
      pluginOptions: {}
    };

    var handlers = pluginInstance.activate(this);
    for (var eventName in handlers) {
      // TODO(danvk): validate eventName.
      pluginDict.events[eventName] = handlers[eventName];
    }

    this.plugins_.push(pluginDict);
  }

  // At this point, plugins can no longer register event handlers.
  // Construct a map from event -> ordered list of [callback, plugin].
  for (var i = 0; i < this.plugins_.length; i++) {
    var plugin_dict = this.plugins_[i];
    for (var eventName in plugin_dict.events) {
      if (!plugin_dict.events.hasOwnProperty(eventName)) continue;
      var callback = plugin_dict.events[eventName];

      var pair = [plugin_dict.plugin, callback];
      if (!(eventName in this.eventListeners_)) {
        this.eventListeners_[eventName] = [pair];
      } else {
        this.eventListeners_[eventName].push(pair);
      }
    }
  }

  this.createDragInterface_();

  this.start_();
};

/**
 * Triggers a cascade of events to the various plugins which are interested in them.
 * Returns true if the "default behavior" should be performed, i.e. if none of
 * the event listeners called event.preventDefault().
 * @private
 */
Dygraph.prototype.cascadeEvents_ = function(name, extra_props) {
  if (!(name in this.eventListeners_)) return true;

  // QUESTION: can we use objects & prototypes to speed this up?
  var e = {
    dygraph: this,
    cancelable: false,
    defaultPrevented: false,
    preventDefault: function() {
      if (!e.cancelable) throw "Cannot call preventDefault on non-cancelable event.";
      e.defaultPrevented = true;
    },
    propagationStopped: false,
    stopPropagation: function() {
      e.propagationStopped = true;
    }
  };
  Dygraph.update(e, extra_props);

  var callback_plugin_pairs = this.eventListeners_[name];
  if (callback_plugin_pairs) {
    for (var i = callback_plugin_pairs.length - 1; i >= 0; i--) {
      var plugin = callback_plugin_pairs[i][0];
      var callback = callback_plugin_pairs[i][1];
      callback.call(plugin, e);
      if (e.propagationStopped) break;
    }
  }
  return e.defaultPrevented;
};

/**
 * Returns the zoomed status of the chart for one or both axes.
 *
 * Axis is an optional parameter. Can be set to 'x' or 'y'.
 *
 * The zoomed status for an axis is set whenever a user zooms using the mouse
 * or when the dateWindow or valueRange are updated (unless the
 * isZoomedIgnoreProgrammaticZoom option is also specified).
 */
Dygraph.prototype.isZoomed = function(axis) {
  if (axis === null || axis === undefined) {
    return this.zoomed_x_ || this.zoomed_y_;
  }
  if (axis === 'x') return this.zoomed_x_;
  if (axis === 'y') return this.zoomed_y_;
  throw "axis parameter is [" + axis + "] must be null, 'x' or 'y'.";
};

/**
 * Returns information about the Dygraph object, including its containing ID.
 */
Dygraph.prototype.toString = function() {
  var maindiv = this.maindiv_;
  var id = (maindiv && maindiv.id) ? maindiv.id : maindiv;
  return "[Dygraph " + id + "]";
};

/**
 * @private
 * Returns the value of an option. This may be set by the user (either in the
 * constructor or by calling updateOptions) or by dygraphs, and may be set to a
 * per-series value.
 * @param { String } name The name of the option, e.g. 'rollPeriod'.
 * @param { String } [seriesName] The name of the series to which the option
 * will be applied. If no per-series value of this option is available, then
 * the global value is returned. This is optional.
 * @return { ... } The value of the option.
 */
Dygraph.prototype.attr_ = function(name, seriesName) {
// <REMOVE_FOR_COMBINED>
  if (typeof(Dygraph.OPTIONS_REFERENCE) === 'undefined') {
    this.error('Must include options reference JS for testing');
  } else if (!Dygraph.OPTIONS_REFERENCE.hasOwnProperty(name)) {
    this.error('Dygraphs is using property ' + name + ', which has no entry ' +
               'in the Dygraphs.OPTIONS_REFERENCE listing.');
    // Only log this error once.
    Dygraph.OPTIONS_REFERENCE[name] = true;
  }
// </REMOVE_FOR_COMBINED>
  return seriesName ? this.attributes_.getForSeries(name, seriesName) : this.attributes_.get(name);
};

/**
 * Returns the current value for an option, as set in the constructor or via
 * updateOptions. You may pass in an (optional) series name to get per-series
 * values for the option.
 *
 * All values returned by this method should be considered immutable. If you
 * modify them, there is no guarantee that the changes will be honored or that
 * dygraphs will remain in a consistent state. If you want to modify an option,
 * use updateOptions() instead.
 *
 * @param { String } name The name of the option (e.g. 'strokeWidth')
 * @param { String } [opt_seriesName] Series name to get per-series values.
 * @return { ... } The value of the option.
 */
Dygraph.prototype.getOption = function(name, opt_seriesName) {
  return this.attr_(name, opt_seriesName);
};

Dygraph.prototype.getOptionForAxis = function(name, axis) {
  return this.attributes_.getForAxis(name, axis);
};

/**
 * @private
 * @param  String} axis The name of the axis (i.e. 'x', 'y' or 'y2')
 * @return { ... } A function mapping string -> option value
 */
Dygraph.prototype.optionsViewForAxis_ = function(axis) {
  var self = this;
  return function(opt) {
    var axis_opts = self.user_attrs_.axes;
    if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
      return axis_opts[axis][opt];
    }
    // user-specified attributes always trump defaults, even if they're less
    // specific.
    if (typeof(self.user_attrs_[opt]) != 'undefined') {
      return self.user_attrs_[opt];
    }

    axis_opts = self.attrs_.axes;
    if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
      return axis_opts[axis][opt];
    }
    // check old-style axis options
    // TODO(danvk): add a deprecation warning if either of these match.
    if (axis == 'y' && self.axes_[0].hasOwnProperty(opt)) {
      return self.axes_[0][opt];
    } else if (axis == 'y2' && self.axes_[1].hasOwnProperty(opt)) {
      return self.axes_[1][opt];
    }
    return self.attr_(opt);
  };
};

/**
 * Returns the current rolling period, as set by the user or an option.
 * @return {Number} The number of points in the rolling window
 */
Dygraph.prototype.rollPeriod = function() {
  return this.rollPeriod_;
};

/**
 * Returns the currently-visible x-range. This can be affected by zooming,
 * panning or a call to updateOptions.
 * Returns a two-element array: [left, right].
 * If the Dygraph has dates on the x-axis, these will be millis since epoch.
 */
Dygraph.prototype.xAxisRange = function() {
  return this.dateWindow_ ? this.dateWindow_ : this.xAxisExtremes();
};

/**
 * Returns the lower- and upper-bound x-axis values of the
 * data set.
 */
Dygraph.prototype.xAxisExtremes = function() {
  var pad = this.attr_('xRangePad') / this.plotter_.area.w;
  if (this.numRows() === 0) {
    return [0 - pad, 1 + pad];
  }
  var left = this.rawData_[0][0];
  var right = this.rawData_[this.rawData_.length - 1][0];
  if (pad) {
    // Must keep this in sync with dygraph-layout _evaluateLimits()
    var range = right - left;
    left -= range * pad;
    right += range * pad;
  }
  return [left, right];
};

/**
 * Returns the currently-visible y-range for an axis. This can be affected by
 * zooming, panning or a call to updateOptions. Axis indices are zero-based. If
 * called with no arguments, returns the range of the first axis.
 * Returns a two-element array: [bottom, top].
 */
Dygraph.prototype.yAxisRange = function(idx) {
  if (typeof(idx) == "undefined") idx = 0;
  if (idx < 0 || idx >= this.axes_.length) {
    return null;
  }
  var axis = this.axes_[idx];
  return [ axis.computedValueRange[0], axis.computedValueRange[1] ];
};

/**
 * Returns the currently-visible y-ranges for each axis. This can be affected by
 * zooming, panning, calls to updateOptions, etc.
 * Returns an array of [bottom, top] pairs, one for each y-axis.
 */
Dygraph.prototype.yAxisRanges = function() {
  var ret = [];
  for (var i = 0; i < this.axes_.length; i++) {
    ret.push(this.yAxisRange(i));
  }
  return ret;
};

// TODO(danvk): use these functions throughout dygraphs.
/**
 * Convert from data coordinates to canvas/div X/Y coordinates.
 * If specified, do this conversion for the coordinate system of a particular
 * axis. Uses the first axis by default.
 * Returns a two-element array: [X, Y]
 *
 * Note: use toDomXCoord instead of toDomCoords(x, null) and use toDomYCoord
 * instead of toDomCoords(null, y, axis).
 */
Dygraph.prototype.toDomCoords = function(x, y, axis) {
  return [ this.toDomXCoord(x), this.toDomYCoord(y, axis) ];
};

/**
 * Convert from data x coordinates to canvas/div X coordinate.
 * If specified, do this conversion for the coordinate system of a particular
 * axis.
 * Returns a single value or null if x is null.
 */
Dygraph.prototype.toDomXCoord = function(x) {
  if (x === null) {
    return null;
  }

  var area = this.plotter_.area;
  var xRange = this.xAxisRange();
  return area.x + (x - xRange[0]) / (xRange[1] - xRange[0]) * area.w;
};

/**
 * Convert from data x coordinates to canvas/div Y coordinate and optional
 * axis. Uses the first axis by default.
 *
 * returns a single value or null if y is null.
 */
Dygraph.prototype.toDomYCoord = function(y, axis) {
  var pct = this.toPercentYCoord(y, axis);

  if (pct === null) {
    return null;
  }
  var area = this.plotter_.area;
  return area.y + pct * area.h;
};

/**
 * Convert from canvas/div coords to data coordinates.
 * If specified, do this conversion for the coordinate system of a particular
 * axis. Uses the first axis by default.
 * Returns a two-element array: [X, Y].
 *
 * Note: use toDataXCoord instead of toDataCoords(x, null) and use toDataYCoord
 * instead of toDataCoords(null, y, axis).
 */
Dygraph.prototype.toDataCoords = function(x, y, axis) {
  return [ this.toDataXCoord(x), this.toDataYCoord(y, axis) ];
};

/**
 * Convert from canvas/div x coordinate to data coordinate.
 *
 * If x is null, this returns null.
 */
Dygraph.prototype.toDataXCoord = function(x) {
  if (x === null) {
    return null;
  }

  var area = this.plotter_.area;
  var xRange = this.xAxisRange();
  return xRange[0] + (x - area.x) / area.w * (xRange[1] - xRange[0]);
};

/**
 * Convert from canvas/div y coord to value.
 *
 * If y is null, this returns null.
 * if axis is null, this uses the first axis.
 */
Dygraph.prototype.toDataYCoord = function(y, axis) {
  if (y === null) {
    return null;
  }

  var area = this.plotter_.area;
  var yRange = this.yAxisRange(axis);

  if (typeof(axis) == "undefined") axis = 0;
  if (!this.attributes_.getForAxis("logscale", axis)) {
    return yRange[0] + (area.y + area.h - y) / area.h * (yRange[1] - yRange[0]);
  } else {
    // Computing the inverse of toDomCoord.
    var pct = (y - area.y) / area.h;

    // Computing the inverse of toPercentYCoord. The function was arrived at with
    // the following steps:
    //
    // Original calcuation:
    // pct = (logr1 - Dygraph.log10(y)) / (logr1 - Dygraph.log10(yRange[0]));
    //
    // Move denominator to both sides:
    // pct * (logr1 - Dygraph.log10(yRange[0])) = logr1 - Dygraph.log10(y);
    //
    // subtract logr1, and take the negative value.
    // logr1 - (pct * (logr1 - Dygraph.log10(yRange[0]))) = Dygraph.log10(y);
    //
    // Swap both sides of the equation, and we can compute the log of the
    // return value. Which means we just need to use that as the exponent in
    // e^exponent.
    // Dygraph.log10(y) = logr1 - (pct * (logr1 - Dygraph.log10(yRange[0])));

    var logr1 = Dygraph.log10(yRange[1]);
    var exponent = logr1 - (pct * (logr1 - Dygraph.log10(yRange[0])));
    var value = Math.pow(Dygraph.LOG_SCALE, exponent);
    return value;
  }
};

/**
 * Converts a y for an axis to a percentage from the top to the
 * bottom of the drawing area.
 *
 * If the coordinate represents a value visible on the canvas, then
 * the value will be between 0 and 1, where 0 is the top of the canvas.
 * However, this method will return values outside the range, as
 * values can fall outside the canvas.
 *
 * If y is null, this returns null.
 * if axis is null, this uses the first axis.
 *
 * @param { Number } y The data y-coordinate.
 * @param { Number } [axis] The axis number on which the data coordinate lives.
 * @return { Number } A fraction in [0, 1] where 0 = the top edge.
 */
Dygraph.prototype.toPercentYCoord = function(y, axis) {
  if (y === null) {
    return null;
  }
  if (typeof(axis) == "undefined") axis = 0;

  var yRange = this.yAxisRange(axis);

  var pct;
  var logscale = this.attributes_.getForAxis("logscale", axis);
  if (!logscale) {
    // yRange[1] - y is unit distance from the bottom.
    // yRange[1] - yRange[0] is the scale of the range.
    // (yRange[1] - y) / (yRange[1] - yRange[0]) is the % from the bottom.
    pct = (yRange[1] - y) / (yRange[1] - yRange[0]);
  } else {
    var logr1 = Dygraph.log10(yRange[1]);
    pct = (logr1 - Dygraph.log10(y)) / (logr1 - Dygraph.log10(yRange[0]));
  }
  return pct;
};

/**
 * Converts an x value to a percentage from the left to the right of
 * the drawing area.
 *
 * If the coordinate represents a value visible on the canvas, then
 * the value will be between 0 and 1, where 0 is the left of the canvas.
 * However, this method will return values outside the range, as
 * values can fall outside the canvas.
 *
 * If x is null, this returns null.
 * @param { Number } x The data x-coordinate.
 * @return { Number } A fraction in [0, 1] where 0 = the left edge.
 */
Dygraph.prototype.toPercentXCoord = function(x) {
  if (x === null) {
    return null;
  }

  var xRange = this.xAxisRange();
  return (x - xRange[0]) / (xRange[1] - xRange[0]);
};

/**
 * Returns the number of columns (including the independent variable).
 * @return { Integer } The number of columns.
 */
Dygraph.prototype.numColumns = function() {
  if (!this.rawData_) return 0;
  return this.rawData_[0] ? this.rawData_[0].length : this.attr_("labels").length;
};

/**
 * Returns the number of rows (excluding any header/label row).
 * @return { Integer } The number of rows, less any header.
 */
Dygraph.prototype.numRows = function() {
  if (!this.rawData_) return 0;
  return this.rawData_.length;
};

/**
 * Returns the value in the given row and column. If the row and column exceed
 * the bounds on the data, returns null. Also returns null if the value is
 * missing.
 * @param { Number} row The row number of the data (0-based). Row 0 is the
 * first row of data, not a header row.
 * @param { Number} col The column number of the data (0-based)
 * @return { Number } The value in the specified cell or null if the row/col
 * were out of range.
 */
Dygraph.prototype.getValue = function(row, col) {
  if (row < 0 || row > this.rawData_.length) return null;
  if (col < 0 || col > this.rawData_[row].length) return null;

  return this.rawData_[row][col];
};

/**
 * Generates interface elements for the Dygraph: a containing div, a div to
 * display the current point, and a textbox to adjust the rolling average
 * period. Also creates the Renderer/Layout elements.
 * @private
 */
Dygraph.prototype.createInterface_ = function() {
  // Create the all-enclosing graph div
  var enclosing = this.maindiv_;

  this.graphDiv = document.createElement("div");

  // TODO(danvk): any other styles that are useful to set here?
  this.graphDiv.style.textAlign = 'left';  // This is a CSS "reset"
  enclosing.appendChild(this.graphDiv);

  // Create the canvas for interactive parts of the chart.
  this.canvas_ = Dygraph.createCanvas();
  this.canvas_.style.position = "absolute";

  // ... and for static parts of the chart.
  this.hidden_ = this.createPlotKitCanvas_(this.canvas_);

  this.resizeElements_();

  this.canvas_ctx_ = Dygraph.getContext(this.canvas_);
  this.hidden_ctx_ = Dygraph.getContext(this.hidden_);

  // The interactive parts of the graph are drawn on top of the chart.
  this.graphDiv.appendChild(this.hidden_);
  this.graphDiv.appendChild(this.canvas_);
  this.mouseEventElement_ = this.createMouseEventElement_();

  // Create the grapher
  this.layout_ = new DygraphLayout(this);

  var dygraph = this;

  this.mouseMoveHandler_ = function(e) {
    dygraph.mouseMove_(e);
  };

  this.mouseOutHandler_ = function(e) {
    // The mouse has left the chart if:
    // 1. e.target is inside the chart
    // 2. e.relatedTarget is outside the chart
    var target = e.target || e.fromElement;
    var relatedTarget = e.relatedTarget || e.toElement;
    if (Dygraph.isNodeContainedBy(target, dygraph.graphDiv) &&
        !Dygraph.isNodeContainedBy(relatedTarget, dygraph.graphDiv)) {
      dygraph.mouseOut_(e);
    }
  };

  this.addAndTrackEvent(window, 'mouseout', this.mouseOutHandler_);
  this.addAndTrackEvent(this.mouseEventElement_, 'mousemove', this.mouseMoveHandler_);

  // Don't recreate and register the resize handler on subsequent calls.
  // This happens when the graph is resized.
  if (!this.resizeHandler_) {
    this.resizeHandler_ = function(e) {
      dygraph.resize();
    };

    // Update when the window is resized.
    // TODO(danvk): drop frames depending on complexity of the chart.
    this.addAndTrackEvent(window, 'resize', this.resizeHandler_);
  }
};

Dygraph.prototype.resizeElements_ = function() {
  this.graphDiv.style.width = this.width_ + "px";
  this.graphDiv.style.height = this.height_ + "px";
  this.canvas_.width = this.width_;
  this.canvas_.height = this.height_;
  this.canvas_.style.width = this.width_ + "px";    // for IE
  this.canvas_.style.height = this.height_ + "px";  // for IE
  this.hidden_.width = this.width_;
  this.hidden_.height = this.height_;
  this.hidden_.style.width = this.width_ + "px";    // for IE
  this.hidden_.style.height = this.height_ + "px";  // for IE
};

/**
 * Detach DOM elements in the dygraph and null out all data references.
 * Calling this when you're done with a dygraph can dramatically reduce memory
 * usage. See, e.g., the tests/perf.html example.
 */
Dygraph.prototype.destroy = function() {
  this.canvas_ctx_.restore();
  this.hidden_ctx_.restore();

  var removeRecursive = function(node) {
    while (node.hasChildNodes()) {
      removeRecursive(node.firstChild);
      node.removeChild(node.firstChild);
    }
  };

  this.removeTrackedEvents_();

  // remove mouse event handlers (This may not be necessary anymore)
  Dygraph.removeEvent(window, 'mouseout', this.mouseOutHandler_);
  Dygraph.removeEvent(this.mouseEventElement_, 'mousemove', this.mouseMoveHandler_);

  // remove window handlers
  Dygraph.removeEvent(window,'resize',this.resizeHandler_);
  this.resizeHandler_ = null;

  removeRecursive(this.maindiv_);

  var nullOut = function(obj) {
    for (var n in obj) {
      if (typeof(obj[n]) === 'object') {
        obj[n] = null;
      }
    }
  };
  // These may not all be necessary, but it can't hurt...
  nullOut(this.layout_);
  nullOut(this.plotter_);
  nullOut(this);
};

/**
 * Creates the canvas on which the chart will be drawn. Only the Renderer ever
 * draws on this particular canvas. All Dygraph work (i.e. drawing hover dots
 * or the zoom rectangles) is done on this.canvas_.
 * @param {Object} canvas The Dygraph canvas over which to overlay the plot
 * @return {Object} The newly-created canvas
 * @private
 */
Dygraph.prototype.createPlotKitCanvas_ = function(canvas) {
  var h = Dygraph.createCanvas();
  h.style.position = "absolute";
  // TODO(danvk): h should be offset from canvas. canvas needs to include
  // some extra area to make it easier to zoom in on the far left and far
  // right. h needs to be precisely the plot area, so that clipping occurs.
  h.style.top = canvas.style.top;
  h.style.left = canvas.style.left;
  h.width = this.width_;
  h.height = this.height_;
  h.style.width = this.width_ + "px";    // for IE
  h.style.height = this.height_ + "px";  // for IE
  return h;
};

/**
 * Creates an overlay element used to handle mouse events.
 * @return {Object} The mouse event element.
 * @private
 */
Dygraph.prototype.createMouseEventElement_ = function() {
  if (this.isUsingExcanvas_) {
    var elem = document.createElement("div");
    elem.style.position = 'absolute';
    elem.style.backgroundColor = 'white';
    elem.style.filter = 'alpha(opacity=0)';
    elem.style.width = this.width_ + "px";
    elem.style.height = this.height_ + "px";
    this.graphDiv.appendChild(elem);
    return elem;
  } else {
    return this.canvas_;
  }
};

/**
 * Generate a set of distinct colors for the data series. This is done with a
 * color wheel. Saturation/Value are customizable, and the hue is
 * equally-spaced around the color wheel. If a custom set of colors is
 * specified, that is used instead.
 * @private
 */
Dygraph.prototype.setColors_ = function() {
  var labels = this.getLabels();
  var num = labels.length - 1;
  this.colors_ = [];
  this.colorsMap_ = {};
  var colors = this.attr_('colors');
  var i;
  if (!colors) {
    var sat = this.attr_('colorSaturation') || 1.0;
    var val = this.attr_('colorValue') || 0.5;
    var half = Math.ceil(num / 2);
    for (i = 1; i <= num; i++) {
      if (!this.visibility()[i-1]) continue;
      // alternate colors for high contrast.
      var idx = i % 2 ? Math.ceil(i / 2) : (half + i / 2);
      var hue = (1.0 * idx/ (1 + num));
      var colorStr = Dygraph.hsvToRGB(hue, sat, val);
      this.colors_.push(colorStr);
      this.colorsMap_[labels[i]] = colorStr;
    }
  } else {
    for (i = 0; i < num; i++) {
      if (!this.visibility()[i]) continue;
      var colorStr = colors[i % colors.length];
      this.colors_.push(colorStr);
      this.colorsMap_[labels[1 + i]] = colorStr;
    }
  }
};

/**
 * Return the list of colors. This is either the list of colors passed in the
 * attributes or the autogenerated list of rgb(r,g,b) strings.
 * This does not return colors for invisible series.
 * @return {Array<string>} The list of colors.
 */
Dygraph.prototype.getColors = function() {
  return this.colors_;
};

/**
 * Returns a few attributes of a series, i.e. its color, its visibility, which
 * axis it's assigned to, and its column in the original data.
 * Returns null if the series does not exist.
 * Otherwise, returns an object with column, visibility, color and axis properties.
 * The "axis" property will be set to 1 for y1 and 2 for y2.
 * The "column" property can be fed back into getValue(row, column) to get
 * values for this series.
 */
Dygraph.prototype.getPropertiesForSeries = function(series_name) {
  var idx = -1;
  var labels = this.getLabels();
  for (var i = 1; i < labels.length; i++) {
    if (labels[i] == series_name) {
      idx = i;
      break;
    }
  }
  if (idx == -1) return null;

  return {
    name: series_name,
    column: idx,
    visible: this.visibility()[idx - 1],
    color: this.colorsMap_[series_name],
    axis: 1 + this.attributes_.axisForSeries(series_name)
  };
};

/**
 * Create the text box to adjust the averaging period
 * @private
 */
Dygraph.prototype.createRollInterface_ = function() {
  // Create a roller if one doesn't exist already.
  if (!this.roller_) {
    this.roller_ = document.createElement("input");
    this.roller_.type = "text";
    this.roller_.style.display = "none";
    this.graphDiv.appendChild(this.roller_);
  }

  var display = this.attr_('showRoller') ? 'block' : 'none';

  var area = this.plotter_.area;
  var textAttr = { "position": "absolute",
                   "zIndex": 10,
                   "top": (area.y + area.h - 25) + "px",
                   "left": (area.x + 1) + "px",
                   "display": display
                  };
  this.roller_.size = "2";
  this.roller_.value = this.rollPeriod_;
  for (var name in textAttr) {
    if (textAttr.hasOwnProperty(name)) {
      this.roller_.style[name] = textAttr[name];
    }
  }

  var dygraph = this;
  this.roller_.onchange = function() { dygraph.adjustRoll(dygraph.roller_.value); };
};

/**
 * @private
 * Converts page the x-coordinate of the event to pixel x-coordinates on the
 * canvas (i.e. DOM Coords).
 */
Dygraph.prototype.dragGetX_ = function(e, context) {
  return Dygraph.pageX(e) - context.px;
};

/**
 * @private
 * Converts page the y-coordinate of the event to pixel y-coordinates on the
 * canvas (i.e. DOM Coords).
 */
Dygraph.prototype.dragGetY_ = function(e, context) {
  return Dygraph.pageY(e) - context.py;
};

/**
 * Set up all the mouse handlers needed to capture dragging behavior for zoom
 * events.
 * @private
 */
Dygraph.prototype.createDragInterface_ = function() {
  var context = {
    // Tracks whether the mouse is down right now
    isZooming: false,
    isPanning: false,  // is this drag part of a pan?
    is2DPan: false,    // if so, is that pan 1- or 2-dimensional?
    dragStartX: null, // pixel coordinates
    dragStartY: null, // pixel coordinates
    dragEndX: null, // pixel coordinates
    dragEndY: null, // pixel coordinates
    dragDirection: null,
    prevEndX: null, // pixel coordinates
    prevEndY: null, // pixel coordinates
    prevDragDirection: null,
    cancelNextDblclick: false,  // see comment in dygraph-interaction-model.js

    // The value on the left side of the graph when a pan operation starts.
    initialLeftmostDate: null,

    // The number of units each pixel spans. (This won't be valid for log
    // scales)
    xUnitsPerPixel: null,

    // TODO(danvk): update this comment
    // The range in second/value units that the viewport encompasses during a
    // panning operation.
    dateRange: null,

    // Top-left corner of the canvas, in DOM coords
    // TODO(konigsberg): Rename topLeftCanvasX, topLeftCanvasY.
    px: 0,
    py: 0,

    // Values for use with panEdgeFraction, which limit how far outside the
    // graph's data boundaries it can be panned.
    boundedDates: null, // [minDate, maxDate]
    boundedValues: null, // [[minValue, maxValue] ...]

    // We cover iframes during mouse interactions. See comments in
    // dygraph-utils.js for more info on why this is a good idea.
    tarp: new Dygraph.IFrameTarp(),

    // contextB is the same thing as this context object but renamed.
    initializeMouseDown: function(event, g, contextB) {
      // prevents mouse drags from selecting page text.
      if (event.preventDefault) {
        event.preventDefault();  // Firefox, Chrome, etc.
      } else {
        event.returnValue = false;  // IE
        event.cancelBubble = true;
      }

      contextB.px = Dygraph.findPosX(g.canvas_);
      contextB.py = Dygraph.findPosY(g.canvas_);
      contextB.dragStartX = g.dragGetX_(event, contextB);
      contextB.dragStartY = g.dragGetY_(event, contextB);
      contextB.cancelNextDblclick = false;
      contextB.tarp.cover();
    }
  };

  var interactionModel = this.attr_("interactionModel");

  // Self is the graph.
  var self = this;

  // Function that binds the graph and context to the handler.
  var bindHandler = function(handler) {
    return function(event) {
      handler(event, self, context);
    };
  };

  for (var eventName in interactionModel) {
    if (!interactionModel.hasOwnProperty(eventName)) continue;
    this.addAndTrackEvent(this.mouseEventElement_, eventName,
        bindHandler(interactionModel[eventName]));
  }

  // If the user releases the mouse button during a drag, but not over the
  // canvas, then it doesn't count as a zooming action.
  var mouseUpHandler = function(event) {
    if (context.isZooming || context.isPanning) {
      context.isZooming = false;
      context.dragStartX = null;
      context.dragStartY = null;
    }

    if (context.isPanning) {
      context.isPanning = false;
      context.draggingDate = null;
      context.dateRange = null;
      for (var i = 0; i < self.axes_.length; i++) {
        delete self.axes_[i].draggingValue;
        delete self.axes_[i].dragValueRange;
      }
    }

    context.tarp.uncover();
  };

  this.addAndTrackEvent(document, 'mouseup', mouseUpHandler);
};

/**
 * Draw a gray zoom rectangle over the desired area of the canvas. Also clears
 * up any previous zoom rectangles that were drawn. This could be optimized to
 * avoid extra redrawing, but it's tricky to avoid interactions with the status
 * dots.
 *
 * @param {Number} direction the direction of the zoom rectangle. Acceptable
 * values are Dygraph.HORIZONTAL and Dygraph.VERTICAL.
 * @param {Number} startX The X position where the drag started, in canvas
 * coordinates.
 * @param {Number} endX The current X position of the drag, in canvas coords.
 * @param {Number} startY The Y position where the drag started, in canvas
 * coordinates.
 * @param {Number} endY The current Y position of the drag, in canvas coords.
 * @param {Number} prevDirection the value of direction on the previous call to
 * this function. Used to avoid excess redrawing
 * @param {Number} prevEndX The value of endX on the previous call to this
 * function. Used to avoid excess redrawing
 * @param {Number} prevEndY The value of endY on the previous call to this
 * function. Used to avoid excess redrawing
 * @private
 */
Dygraph.prototype.drawZoomRect_ = function(direction, startX, endX, startY,
                                           endY, prevDirection, prevEndX,
                                           prevEndY) {
  var ctx = this.canvas_ctx_;

  // Clean up from the previous rect if necessary
  if (prevDirection == Dygraph.HORIZONTAL) {
    ctx.clearRect(Math.min(startX, prevEndX), this.layout_.getPlotArea().y,
                  Math.abs(startX - prevEndX), this.layout_.getPlotArea().h);
  } else if (prevDirection == Dygraph.VERTICAL) {
    ctx.clearRect(this.layout_.getPlotArea().x, Math.min(startY, prevEndY),
                  this.layout_.getPlotArea().w, Math.abs(startY - prevEndY));
  }

  // Draw a light-grey rectangle to show the new viewing area
  if (direction == Dygraph.HORIZONTAL) {
    if (endX && startX) {
      ctx.fillStyle = "rgba(128,128,128,0.33)";
      ctx.fillRect(Math.min(startX, endX), this.layout_.getPlotArea().y,
                   Math.abs(endX - startX), this.layout_.getPlotArea().h);
    }
  } else if (direction == Dygraph.VERTICAL) {
    if (endY && startY) {
      ctx.fillStyle = "rgba(128,128,128,0.33)";
      ctx.fillRect(this.layout_.getPlotArea().x, Math.min(startY, endY),
                   this.layout_.getPlotArea().w, Math.abs(endY - startY));
    }
  }

  if (this.isUsingExcanvas_) {
    this.currentZoomRectArgs_ = [direction, startX, endX, startY, endY, 0, 0, 0];
  }
};

/**
 * Clear the zoom rectangle (and perform no zoom).
 * @private
 */
Dygraph.prototype.clearZoomRect_ = function() {
  this.currentZoomRectArgs_ = null;
  this.canvas_ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
};

/**
 * Zoom to something containing [lowX, highX]. These are pixel coordinates in
 * the canvas. The exact zoom window may be slightly larger if there are no data
 * points near lowX or highX. Don't confuse this function with doZoomXDates,
 * which accepts dates that match the raw data. This function redraws the graph.
 *
 * @param {Number} lowX The leftmost pixel value that should be visible.
 * @param {Number} highX The rightmost pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoomX_ = function(lowX, highX) {
  this.currentZoomRectArgs_ = null;
  // Find the earliest and latest dates contained in this canvasx range.
  // Convert the call to date ranges of the raw data.
  var minDate = this.toDataXCoord(lowX);
  var maxDate = this.toDataXCoord(highX);
  this.doZoomXDates_(minDate, maxDate);
};

/**
 * Transition function to use in animations. Returns values between 0.0
 * (totally old values) and 1.0 (totally new values) for each frame.
 * @private
 */
Dygraph.zoomAnimationFunction = function(frame, numFrames) {
  var k = 1.5;
  return (1.0 - Math.pow(k, -frame)) / (1.0 - Math.pow(k, -numFrames));
};

/**
 * Zoom to something containing [minDate, maxDate] values. Don't confuse this
 * method with doZoomX which accepts pixel coordinates. This function redraws
 * the graph.
 *
 * @param {Number} minDate The minimum date that should be visible.
 * @param {Number} maxDate The maximum date that should be visible.
 * @private
 */
Dygraph.prototype.doZoomXDates_ = function(minDate, maxDate) {
  // TODO(danvk): when yAxisRange is null (i.e. "fit to data", the animation
  // can produce strange effects. Rather than the y-axis transitioning slowly
  // between values, it can jerk around.)
  var old_window = this.xAxisRange();
  var new_window = [minDate, maxDate];
  this.zoomed_x_ = true;
  var that = this;
  this.doAnimatedZoom(old_window, new_window, null, null, function() {
    if (that.attr_("zoomCallback")) {
      that.attr_("zoomCallback")(minDate, maxDate, that.yAxisRanges());
    }
  });
};

/**
 * Zoom to something containing [lowY, highY]. These are pixel coordinates in
 * the canvas. This function redraws the graph.
 *
 * @param {Number} lowY The topmost pixel value that should be visible.
 * @param {Number} highY The lowest pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoomY_ = function(lowY, highY) {
  this.currentZoomRectArgs_ = null;
  // Find the highest and lowest values in pixel range for each axis.
  // Note that lowY (in pixels) corresponds to the max Value (in data coords).
  // This is because pixels increase as you go down on the screen, whereas data
  // coordinates increase as you go up the screen.
  var oldValueRanges = this.yAxisRanges();
  var newValueRanges = [];
  for (var i = 0; i < this.axes_.length; i++) {
    var hi = this.toDataYCoord(lowY, i);
    var low = this.toDataYCoord(highY, i);
    newValueRanges.push([low, hi]);
  }

  this.zoomed_y_ = true;
  var that = this;
  this.doAnimatedZoom(null, null, oldValueRanges, newValueRanges, function() {
    if (that.attr_("zoomCallback")) {
      var xRange = that.xAxisRange();
      that.attr_("zoomCallback")(xRange[0], xRange[1], that.yAxisRanges());
    }
  });
};

/**
 * Reset the zoom to the original view coordinates. This is the same as
 * double-clicking on the graph.
 */
Dygraph.prototype.resetZoom = function() {
  var dirty = false, dirtyX = false, dirtyY = false;
  if (this.dateWindow_ !== null) {
    dirty = true;
    dirtyX = true;
  }

  for (var i = 0; i < this.axes_.length; i++) {
    if (typeof(this.axes_[i].valueWindow) !== 'undefined' && this.axes_[i].valueWindow !== null) {
      dirty = true;
      dirtyY = true;
    }
  }

  // Clear any selection, since it's likely to be drawn in the wrong place.
  this.clearSelection();

  if (dirty) {
    this.zoomed_x_ = false;
    this.zoomed_y_ = false;

    var minDate = this.rawData_[0][0];
    var maxDate = this.rawData_[this.rawData_.length - 1][0];

    // With only one frame, don't bother calculating extreme ranges.
    // TODO(danvk): merge this block w/ the code below.
    if (!this.attr_("animatedZooms")) {
      this.dateWindow_ = null;
      for (i = 0; i < this.axes_.length; i++) {
        if (this.axes_[i].valueWindow !== null) {
          delete this.axes_[i].valueWindow;
        }
      }
      this.drawGraph_();
      if (this.attr_("zoomCallback")) {
        this.attr_("zoomCallback")(minDate, maxDate, this.yAxisRanges());
      }
      return;
    }

    var oldWindow=null, newWindow=null, oldValueRanges=null, newValueRanges=null;
    if (dirtyX) {
      oldWindow = this.xAxisRange();
      newWindow = [minDate, maxDate];
    }

    if (dirtyY) {
      oldValueRanges = this.yAxisRanges();
      // TODO(danvk): this is pretty inefficient
      var packed = this.gatherDatasets_(this.rolledSeries_, null);
      var extremes = packed.extremes;

      // this has the side-effect of modifying this.axes_.
      // this doesn't make much sense in this context, but it's convenient (we
      // need this.axes_[*].extremeValues) and not harmful since we'll be
      // calling drawGraph_ shortly, which clobbers these values.
      this.computeYAxisRanges_(extremes);

      newValueRanges = [];
      for (i = 0; i < this.axes_.length; i++) {
        var axis = this.axes_[i];
        newValueRanges.push((axis.valueRange !== null &&
                             axis.valueRange !== undefined) ?
                            axis.valueRange : axis.extremeRange);
      }
    }

    var that = this;
    this.doAnimatedZoom(oldWindow, newWindow, oldValueRanges, newValueRanges,
        function() {
          that.dateWindow_ = null;
          for (var i = 0; i < that.axes_.length; i++) {
            if (that.axes_[i].valueWindow !== null) {
              delete that.axes_[i].valueWindow;
            }
          }
          if (that.attr_("zoomCallback")) {
            that.attr_("zoomCallback")(minDate, maxDate, that.yAxisRanges());
          }
        });
  }
};

/**
 * Combined animation logic for all zoom functions.
 * either the x parameters or y parameters may be null.
 * @private
 */
Dygraph.prototype.doAnimatedZoom = function(oldXRange, newXRange, oldYRanges, newYRanges, callback) {
  var steps = this.attr_("animatedZooms") ? Dygraph.ANIMATION_STEPS : 1;

  var windows = [];
  var valueRanges = [];
  var step, frac;

  if (oldXRange !== null && newXRange !== null) {
    for (step = 1; step <= steps; step++) {
      frac = Dygraph.zoomAnimationFunction(step, steps);
      windows[step-1] = [oldXRange[0]*(1-frac) + frac*newXRange[0],
                         oldXRange[1]*(1-frac) + frac*newXRange[1]];
    }
  }

  if (oldYRanges !== null && newYRanges !== null) {
    for (step = 1; step <= steps; step++) {
      frac = Dygraph.zoomAnimationFunction(step, steps);
      var thisRange = [];
      for (var j = 0; j < this.axes_.length; j++) {
        thisRange.push([oldYRanges[j][0]*(1-frac) + frac*newYRanges[j][0],
                        oldYRanges[j][1]*(1-frac) + frac*newYRanges[j][1]]);
      }
      valueRanges[step-1] = thisRange;
    }
  }

  var that = this;
  Dygraph.repeatAndCleanup(function(step) {
    if (valueRanges.length) {
      for (var i = 0; i < that.axes_.length; i++) {
        var w = valueRanges[step][i];
        that.axes_[i].valueWindow = [w[0], w[1]];
      }
    }
    if (windows.length) {
      that.dateWindow_ = windows[step];
    }
    that.drawGraph_();
  }, steps, Dygraph.ANIMATION_DURATION / steps, callback);
};

/**
 * Get the current graph's area object.
 *
 * Returns: {x, y, w, h}
 */
Dygraph.prototype.getArea = function() {
  return this.plotter_.area;
};

/**
 * Convert a mouse event to DOM coordinates relative to the graph origin.
 *
 * Returns a two-element array: [X, Y].
 */
Dygraph.prototype.eventToDomCoords = function(event) {
  if (event.offsetX && event.offsetY) {
    return [ event.offsetX, event.offsetY ];
  } else {
    var canvasx = Dygraph.pageX(event) - Dygraph.findPosX(this.mouseEventElement_);
    var canvasy = Dygraph.pageY(event) - Dygraph.findPosY(this.mouseEventElement_);
    return [canvasx, canvasy];
  }
};

/**
 * Given a canvas X coordinate, find the closest row.
 * @param {Number} domX graph-relative DOM X coordinate
 * Returns: row number, integer
 * @private
 */
Dygraph.prototype.findClosestRow = function(domX) {
  var minDistX = Infinity;
  var closestRow = -1;
  var sets = this.layout_.points;
  for (var i = 0; i < sets.length; i++) {
    var points = sets[i];
    var len = points.length;
    for (var j = 0; j < len; j++) {
      var point = points[j];
      if (!Dygraph.isValidPoint(point, true)) continue;
      var dist = Math.abs(point.canvasx - domX);
      if (dist < minDistX) {
        minDistX = dist;
        closestRow = point.idx;
      }
    }
  }

  return closestRow;
};

/**
 * Given canvas X,Y coordinates, find the closest point.
 *
 * This finds the individual data point across all visible series
 * that's closest to the supplied DOM coordinates using the standard
 * Euclidean X,Y distance.
 *
 * @param {Number} domX graph-relative DOM X coordinate
 * @param {Number} domY graph-relative DOM Y coordinate
 * Returns: {row, seriesName, point}
 * @private
 */
Dygraph.prototype.findClosestPoint = function(domX, domY) {
  var minDist = Infinity;
  var dist, dx, dy, point, closestPoint, closestSeries, closestRow;
  for ( var setIdx = this.layout_.points.length - 1 ; setIdx >= 0 ; --setIdx ) {
    var points = this.layout_.points[setIdx];
    for (var i = 0; i < points.length; ++i) {
      point = points[i];
      if (!Dygraph.isValidPoint(point)) continue;
      dx = point.canvasx - domX;
      dy = point.canvasy - domY;
      dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
        closestSeries = setIdx;
        closestRow = point.idx;
      }
    }
  }
  var name = this.layout_.setNames[closestSeries];
  return {
    row: closestRow,
    seriesName: name,
    point: closestPoint
  };
};

/**
 * Given canvas X,Y coordinates, find the touched area in a stacked graph.
 *
 * This first finds the X data point closest to the supplied DOM X coordinate,
 * then finds the series which puts the Y coordinate on top of its filled area,
 * using linear interpolation between adjacent point pairs.
 *
 * @param {Number} domX graph-relative DOM X coordinate
 * @param {Number} domY graph-relative DOM Y coordinate
 * Returns: {row, seriesName, point}
 * @private
 */
Dygraph.prototype.findStackedPoint = function(domX, domY) {
  var row = this.findClosestRow(domX);
  var closestPoint, closestSeries;
  for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
    var boundary = this.getLeftBoundary_(setIdx);
    var rowIdx = row - boundary;
    var points = this.layout_.points[setIdx];
    if (rowIdx >= points.length) continue;
    var p1 = points[rowIdx];
    if (!Dygraph.isValidPoint(p1)) continue;
    var py = p1.canvasy;
    if (domX > p1.canvasx && rowIdx + 1 < points.length) {
      // interpolate series Y value using next point
      var p2 = points[rowIdx + 1];
      if (Dygraph.isValidPoint(p2)) {
        var dx = p2.canvasx - p1.canvasx;
        if (dx > 0) {
          var r = (domX - p1.canvasx) / dx;
          py += r * (p2.canvasy - p1.canvasy);
        }
      }
    } else if (domX < p1.canvasx && rowIdx > 0) {
      // interpolate series Y value using previous point
      var p0 = points[rowIdx - 1];
      if (Dygraph.isValidPoint(p0)) {
        var dx = p1.canvasx - p0.canvasx;
        if (dx > 0) {
          var r = (p1.canvasx - domX) / dx;
          py += r * (p0.canvasy - p1.canvasy);
        }
      }
    }
    // Stop if the point (domX, py) is above this series' upper edge
    if (setIdx === 0 || py < domY) {
      closestPoint = p1;
      closestSeries = setIdx;
    }
  }
  var name = this.layout_.setNames[closestSeries];
  return {
    row: row,
    seriesName: name,
    point: closestPoint
  };
};

/**
 * When the mouse moves in the canvas, display information about a nearby data
 * point and draw dots over those points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @param {Object} event The mousemove event from the browser.
 * @private
 */
Dygraph.prototype.mouseMove_ = function(event) {
  // This prevents JS errors when mousing over the canvas before data loads.
  var points = this.layout_.points;
  if (points === undefined || points === null) return;

  var canvasCoords = this.eventToDomCoords(event);
  var canvasx = canvasCoords[0];
  var canvasy = canvasCoords[1];

  var highlightSeriesOpts = this.attr_("highlightSeriesOpts");
  var selectionChanged = false;
  if (highlightSeriesOpts && !this.isSeriesLocked()) {
    var closest;
    if (this.attr_("stackedGraph")) {
      closest = this.findStackedPoint(canvasx, canvasy);
    } else {
      closest = this.findClosestPoint(canvasx, canvasy);
    }
    selectionChanged = this.setSelection(closest.row, closest.seriesName);
  } else {
    var idx = this.findClosestRow(canvasx);
    selectionChanged = this.setSelection(idx);
  }

  var callback = this.attr_("highlightCallback");
  if (callback && selectionChanged) {
    callback(event,
        this.lastx_,
        this.selPoints_,
        this.lastRow_,
        this.highlightSet_);
  }
};

/**
 * Fetch left offset from the specified set index or if not passed, the 
 * first defined boundaryIds record (see bug #236).
 * @private
 */
Dygraph.prototype.getLeftBoundary_ = function(setIdx) {
  if (this.boundaryIds_[setIdx]) {
      return this.boundaryIds_[setIdx][0];
  } else {
    for (var i = 0; i < this.boundaryIds_.length; i++) {
      if (this.boundaryIds_[i] !== undefined) {
        return this.boundaryIds_[i][0];
      }
    }
    return 0;
  }
};

Dygraph.prototype.animateSelection_ = function(direction) {
  var totalSteps = 10;
  var millis = 30;
  if (this.fadeLevel === undefined) this.fadeLevel = 0;
  if (this.animateId === undefined) this.animateId = 0;
  var start = this.fadeLevel;
  var steps = direction < 0 ? start : totalSteps - start;
  if (steps <= 0) {
    if (this.fadeLevel) {
      this.updateSelection_(1.0);
    }
    return;
  }

  var thisId = ++this.animateId;
  var that = this;
  Dygraph.repeatAndCleanup(
    function(n) {
      // ignore simultaneous animations
      if (that.animateId != thisId) return;

      that.fadeLevel += direction;
      if (that.fadeLevel === 0) {
        that.clearSelection();
      } else {
        that.updateSelection_(that.fadeLevel / totalSteps);
      }
    },
    steps, millis, function() {});
};

/**
 * Draw dots over the selectied points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @private
 */
Dygraph.prototype.updateSelection_ = function(opt_animFraction) {
  /*var defaultPrevented = */
  this.cascadeEvents_('select', {
    selectedX: this.lastx_,
    selectedPoints: this.selPoints_
  });
  // TODO(danvk): use defaultPrevented here?

  // Clear the previously drawn vertical, if there is one
  var i;
  var ctx = this.canvas_ctx_;
  if (this.attr_('highlightSeriesOpts')) {
    ctx.clearRect(0, 0, this.width_, this.height_);
    var alpha = 1.0 - this.attr_('highlightSeriesBackgroundAlpha');
    if (alpha) {
      // Activating background fade includes an animation effect for a gradual
      // fade. TODO(klausw): make this independently configurable if it causes
      // issues? Use a shared preference to control animations?
      var animateBackgroundFade = true;
      if (animateBackgroundFade) {
        if (opt_animFraction === undefined) {
          // start a new animation
          this.animateSelection_(1);
          return;
        }
        alpha *= opt_animFraction;
      }
      ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
      ctx.fillRect(0, 0, this.width_, this.height_);
    }

    // Redraw only the highlighted series in the interactive canvas (not the
    // static plot canvas, which is where series are usually drawn).
    this.plotter_._renderLineChart(this.highlightSet_, ctx);
  } else if (this.previousVerticalX_ >= 0) {
    // Determine the maximum highlight circle size.
    var maxCircleSize = 0;
    var labels = this.attr_('labels');
    for (i = 1; i < labels.length; i++) {
      var r = this.attr_('highlightCircleSize', labels[i]);
      if (r > maxCircleSize) maxCircleSize = r;
    }
    var px = this.previousVerticalX_;
    ctx.clearRect(px - maxCircleSize - 1, 0,
                  2 * maxCircleSize + 2, this.height_);
  }

  if (this.isUsingExcanvas_ && this.currentZoomRectArgs_) {
    Dygraph.prototype.drawZoomRect_.apply(this, this.currentZoomRectArgs_);
  }

  if (this.selPoints_.length > 0) {
    // Draw colored circles over the center of each selected point
    var canvasx = this.selPoints_[0].canvasx;
    ctx.save();
    for (i = 0; i < this.selPoints_.length; i++) {
      var pt = this.selPoints_[i];
      if (!Dygraph.isOK(pt.canvasy)) continue;

      var circleSize = this.attr_('highlightCircleSize', pt.name);
      var callback = this.attr_("drawHighlightPointCallback", pt.name);
      var color = this.plotter_.colors[pt.name];
      if (!callback) {
        callback = Dygraph.Circles.DEFAULT;
      }
      ctx.lineWidth = this.attr_('strokeWidth', pt.name);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      callback(this.g, pt.name, ctx, canvasx, pt.canvasy,
          color, circleSize, pt.idx);
    }
    ctx.restore();

    this.previousVerticalX_ = canvasx;
  }
};

/**
 * Manually set the selected points and display information about them in the
 * legend. The selection can be cleared using clearSelection() and queried
 * using getSelection().
 * @param { Integer } row number that should be highlighted (i.e. appear with
 * hover dots on the chart). Set to false to clear any selection.
 * @param { seriesName } optional series name to highlight that series with the
 * the highlightSeriesOpts setting.
 * @param { locked } optional If true, keep seriesName selected when mousing
 * over the graph, disabling closest-series highlighting. Call clearSelection()
 * to unlock it.
 */
Dygraph.prototype.setSelection = function(row, opt_seriesName, opt_locked) {
  // Extract the points we've selected
  this.selPoints_ = [];

  var changed = false;
  if (row !== false && row >= 0) {
    if (row != this.lastRow_) changed = true;
    this.lastRow_ = row;
    for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
      var points = this.layout_.points[setIdx];
      var setRow = row - this.getLeftBoundary_(setIdx);
      if (setRow < points.length) {
        var point = points[setRow];
        if (point.yval !== null) this.selPoints_.push(point);
      }
    }
  } else {
    if (this.lastRow_ >= 0) changed = true;
    this.lastRow_ = -1;
  }

  if (this.selPoints_.length) {
    this.lastx_ = this.selPoints_[0].xval;
  } else {
    this.lastx_ = -1;
  }

  if (opt_seriesName !== undefined) {
    if (this.highlightSet_ !== opt_seriesName) changed = true;
    this.highlightSet_ = opt_seriesName;
  }

  if (opt_locked !== undefined) {
    this.lockedSet_ = opt_locked;
  }

  if (changed) {
    this.updateSelection_(undefined);
  }
  return changed;
};

/**
 * The mouse has left the canvas. Clear out whatever artifacts remain
 * @param {Object} event the mouseout event from the browser.
 * @private
 */
Dygraph.prototype.mouseOut_ = function(event) {
  if (this.attr_("unhighlightCallback")) {
    this.attr_("unhighlightCallback")(event);
  }

  if (this.attr_("hideOverlayOnMouseOut") && !this.lockedSet_) {
    this.clearSelection();
  }
};

/**
 * Clears the current selection (i.e. points that were highlighted by moving
 * the mouse over the chart).
 */
Dygraph.prototype.clearSelection = function() {
  this.cascadeEvents_('deselect', {});

  this.lockedSet_ = false;
  // Get rid of the overlay data
  if (this.fadeLevel) {
    this.animateSelection_(-1);
    return;
  }
  this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
  this.fadeLevel = 0;
  this.selPoints_ = [];
  this.lastx_ = -1;
  this.lastRow_ = -1;
  this.highlightSet_ = null;
};

/**
 * Returns the number of the currently selected row. To get data for this row,
 * you can use the getValue method.
 * @return { Integer } row number, or -1 if nothing is selected
 */
Dygraph.prototype.getSelection = function() {
  if (!this.selPoints_ || this.selPoints_.length < 1) {
    return -1;
  }

  for (var setIdx = 0; setIdx < this.layout_.points.length; setIdx++) {
    var points = this.layout_.points[setIdx];
    for (var row = 0; row < points.length; row++) {
      if (points[row].x == this.selPoints_[0].x) {
        return points[row].idx;
      }
    }
  }
  return -1;
};

/**
 * Returns the name of the currently-highlighted series.
 * Only available when the highlightSeriesOpts option is in use.
 */
Dygraph.prototype.getHighlightSeries = function() {
  return this.highlightSet_;
};

/**
 * Returns true if the currently-highlighted series was locked
 * via setSelection(..., seriesName, true).
 */
Dygraph.prototype.isSeriesLocked = function() {
  return this.lockedSet_;
};

/**
 * Fires when there's data available to be graphed.
 * @param {String} data Raw CSV data to be plotted
 * @private
 */
Dygraph.prototype.loadedEvent_ = function(data) {
  this.rawData_ = this.parseCSV_(data);
  this.predraw_();
};

/**
 * Add ticks on the x-axis representing years, months, quarters, weeks, or days
 * @private
 */
Dygraph.prototype.addXTicks_ = function() {
  // Determine the correct ticks scale on the x-axis: quarterly, monthly, ...
  var range;
  if (this.dateWindow_) {
    range = [this.dateWindow_[0], this.dateWindow_[1]];
  } else {
    range = this.xAxisExtremes();
  }

  var xAxisOptionsView = this.optionsViewForAxis_('x');
  var xTicks = xAxisOptionsView('ticker')(
      range[0],
      range[1],
      this.width_,  // TODO(danvk): should be area.width
      xAxisOptionsView,
      this);
  // var msg = 'ticker(' + range[0] + ', ' + range[1] + ', ' + this.width_ + ', ' + this.attr_('pixelsPerXLabel') + ') -> ' + JSON.stringify(xTicks);
  // console.log(msg);
  this.layout_.setXTicks(xTicks);
};

/**
 * @private
 * Computes the range of the data series (including confidence intervals).
 * @param { [Array] } series either [ [x1, y1], [x2, y2], ... ] or
 * [ [x1, [y1, dev_low, dev_high]], [x2, [y2, dev_low, dev_high]], ...
 * @return [low, high]
 */
Dygraph.prototype.extremeValues_ = function(series) {
  var minY = null, maxY = null, j, y;

  var bars = this.attr_("errorBars") || this.attr_("customBars");
  if (bars) {
    // With custom bars, maxY is the max of the high values.
    for (j = 0; j < series.length; j++) {
      y = series[j][1][0];
      if (y === null || isNaN(y)) continue;
      var low = y - series[j][1][1];
      var high = y + series[j][1][2];
      if (low > y) low = y;    // this can happen with custom bars,
      if (high < y) high = y;  // e.g. in tests/custom-bars.html
      if (maxY === null || high > maxY) {
        maxY = high;
      }
      if (minY === null || low < minY) {
        minY = low;
      }
    }
  } else {
    for (j = 0; j < series.length; j++) {
      y = series[j][1];
      if (y === null || isNaN(y)) continue;
      if (maxY === null || y > maxY) {
        maxY = y;
      }
      if (minY === null || y < minY) {
        minY = y;
      }
    }
  }

  return [minY, maxY];
};

/**
 * @private
 * This function is called once when the chart's data is changed or the options
 * dictionary is updated. It is _not_ called when the user pans or zooms. The
 * idea is that values derived from the chart's data can be computed here,
 * rather than every time the chart is drawn. This includes things like the
 * number of axes, rolling averages, etc.
 */
Dygraph.prototype.predraw_ = function() {
  var start = new Date();

  this.layout_.computePlotArea();

  // TODO(danvk): move more computations out of drawGraph_ and into here.
  this.computeYAxes_();

  // Create a new plotter.
  if (this.plotter_) {
    this.cascadeEvents_('clearChart');
    this.plotter_.clear();
  }

  if (!this.is_initial_draw_) {
    this.canvas_ctx_.restore();
    this.hidden_ctx_.restore();
  }

  this.canvas_ctx_.save();
  this.hidden_ctx_.save();

  this.plotter_ = new DygraphCanvasRenderer(this,
                                            this.hidden_,
                                            this.hidden_ctx_,
                                            this.layout_);

  // The roller sits in the bottom left corner of the chart. We don't know where
  // this will be until the options are available, so it's positioned here.
  this.createRollInterface_();

  this.cascadeEvents_('predraw');

  // Convert the raw data (a 2D array) into the internal format and compute
  // rolling averages.
  this.rolledSeries_ = [null];  // x-axis is the first series and it's special
  for (var i = 1; i < this.numColumns(); i++) {
    // var logScale = this.attr_('logscale', i); // TODO(klausw): this looks wrong // konigsberg thinks so too.
    var logScale = this.attr_('logscale');
    var series = this.extractSeries_(this.rawData_, i, logScale);
    series = this.rollingAverage(series, this.rollPeriod_);
    this.rolledSeries_.push(series);
  }

  // If the data or options have changed, then we'd better redraw.
  this.drawGraph_();

  // This is used to determine whether to do various animations.
  var end = new Date();
  this.drawingTimeMs_ = (end - start);
};

/**
 * Point structure.
 *
 * xval_* and yval_* are the original unscaled data values,
 * while x_* and y_* are scaled to the range (0.0-1.0) for plotting.
 * yval_stacked is the cumulative Y value used for stacking graphs,
 * and bottom/top/minus/plus are used for error bar graphs.
 *
 * @typedef {{
 *     idx: number,
 *     name: string,
 *     x: ?number,
 *     xval: ?number,
 *     y_bottom: ?number,
 *     y: ?number,
 *     y_stacked: ?number,
 *     y_top: ?number,
 *     yval_minus: ?number,
 *     yval: ?number,
 *     yval_plus: ?number,
 *     yval_stacked
 * }}
 */
Dygraph.PointType = undefined;

// TODO(bhs): these loops are a hot-spot for high-point-count charts. In fact,
// on chrome+linux, they are 6 times more expensive than iterating through the
// points and drawing the lines. The brunt of the cost comes from allocating
// the |point| structures.
/**
 * Converts a series to a Point array.
 *
 * @private
 * @param {Array.<Array.<(?number|Array<?number>)>} series Array where
 *     series[row] = [x,y] or [x, [y, err]] or [x, [y, yplus, yminus]].
 * @param {boolean} bars True if error bars or custom bars are being drawn.
 * @param {string} setName Name of the series.
 * @param {number} boundaryIdStart Index offset of the first point, equal to
 *     the number of skipped points left of the date window minimum (if any).
 * @return {Array.<Dygraph.PointType>} List of points for this series.
 */
Dygraph.seriesToPoints_ = function(series, bars, setName, boundaryIdStart) {
  var points = [];
  for (var i = 0; i < series.length; ++i) {
    var item = series[i];
    var yraw = bars ? item[1][0] : item[1];
    var yval = yraw === null ? null : DygraphLayout.parseFloat_(yraw);
    var point = {
      x: NaN,
      y: NaN,
      xval: DygraphLayout.parseFloat_(item[0]),
      yval: yval,
      name: setName,  // TODO(danvk): is this really necessary?
      idx: i + boundaryIdStart
    };

    if (bars) {
      point.y_top = NaN;
      point.y_bottom = NaN;
      point.yval_minus = DygraphLayout.parseFloat_(item[1][1]);
      point.yval_plus = DygraphLayout.parseFloat_(item[1][2]);
    }
    points.push(point);
  }
  return points;
};


/**
 * Calculates point stacking for stackedGraph=true.
 *
 * For stacking purposes, interpolate or extend neighboring data across
 * NaN values based on stackedGraphNaNFill settings. This is for display
 * only, the underlying data value as shown in the legend remains NaN.
 *
 * @param {Array.<Dygraph.PointType>} points Point array for a single series.
 *     Updates each Point's yval_stacked property.
 * @param {Array.<number>} cumulativeYval Accumulated top-of-graph stacked Y
 *     values for the series seen so far. Index is the row number. Updated
 *     based on the current series's values.
 * @param {Array.<number>} seriesExtremes Min and max values, updated
 *     to reflect the stacked values.
 * @param {string} fillMethod Interpolation method, one of 'all', 'inside', or
 *     'none'.
 * @private
 */
Dygraph.stackPoints_ = function(
    points, cumulativeYval, seriesExtremes, fillMethod) {
  var lastXval = null;
  var prevPoint = null;
  var nextPoint = null;
  var nextPointIdx = -1;

  // Find the next stackable point starting from the given index.
  var updateNextPoint = function(idx) {
    // If we've previously found a non-NaN point and haven't gone past it yet,
    // just use that.
    if (nextPointIdx >= idx) return;

    // We haven't found a non-NaN point yet or have moved past it,
    // look towards the right to find a non-NaN point.
    for (var j = idx; j < points.length; ++j) {
      // Clear out a previously-found point (if any) since it's no longer
      // valid, we shouldn't use it for interpolation anymore.
      nextPoint = null;
      if (!isNaN(points[j].yval) && points[j].yval !== null) {
        nextPointIdx = j;
        nextPoint = points[j];
        break;
      }
    }
  };

  for (var i = 0; i < points.length; ++i) {
    var point = points[i];
    var xval = point.xval;
    if (cumulativeYval[xval] === undefined) {
      cumulativeYval[xval] = 0;
    }

    var actualYval = point.yval;
    if (isNaN(actualYval) || actualYval === null) {
      // Interpolate/extend for stacking purposes if possible.
      updateNextPoint(i);
      if (prevPoint && nextPoint && fillMethod != 'none') {
        // Use linear interpolation between prevPoint and nextPoint.
        actualYval = prevPoint.yval + (nextPoint.yval - prevPoint.yval) *
            ((xval - prevPoint.xval) / (nextPoint.xval - prevPoint.xval));
      } else if (prevPoint && fillMethod == 'all') {
        actualYval = prevPoint.yval;
      } else if (nextPoint && fillMethod == 'all') {
        actualYval = nextPoint.yval;
      } else {
        actualYval = 0;
      }
    } else {
      prevPoint = point;
    }

    var stackedYval = cumulativeYval[xval];
    if (lastXval != xval) {
      // If an x-value is repeated, we ignore the duplicates.
      stackedYval += actualYval;
      cumulativeYval[xval] = stackedYval;
    }
    lastXval = xval;

    point.yval_stacked = stackedYval;

    if (stackedYval > seriesExtremes[1]) {
      seriesExtremes[1] = stackedYval;
    }
    if (stackedYval < seriesExtremes[0]) {
      seriesExtremes[0] = stackedYval;
    }
  }
};


/**
 * Loop over all fields and create datasets, calculating extreme y-values for
 * each series and extreme x-indices as we go.
 *
 * dateWindow is passed in as an explicit parameter so that we can compute
 * extreme values "speculatively", i.e. without actually setting state on the
 * dygraph.
 *
 * @param {Array.<Array.<Array.<(number|Array<number>)>>} rolledSeries, where
 *     rolledSeries[seriesIndex][row] = raw point, where
 *     seriesIndex is the column number starting with 1, and
 *     rawPoint is [x,y] or [x, [y, err]] or [x, [y, yminus, yplus]].
 * @param {?Array.<number>} dateWindow [xmin, xmax] pair, or null.
 * @return {{
 *     points: Array.<Array.<Dygraph.PointType>>,
 *     seriesExtremes: Array.<Array.<number>>,
 *     boundaryIds: Array.<number>}}
 * @private
 */
Dygraph.prototype.gatherDatasets_ = function(rolledSeries, dateWindow) {
  var boundaryIds = [];
  var points = [];
  var cumulativeYval = [];  // For stacked series.
  var extremes = {};  // series name -> [low, high]
  var i, k;
  var errorBars = this.attr_("errorBars");
  var customBars = this.attr_("customBars");
  var bars = errorBars || customBars;
  var isValueNull = function(sample) {
    if (!bars) {
      return sample[1] === null;
    } else {
      return customBars ? sample[1][1] === null : 
        errorBars ? sample[1][0] === null : false;
    }
  };

  // Loop over the fields (series).  Go from the last to the first,
  // because if they're stacked that's how we accumulate the values.
  var num_series = rolledSeries.length - 1;
  var series;
  for (i = num_series; i >= 1; i--) {
    if (!this.visibility()[i - 1]) continue;

    // Prune down to the desired range, if necessary (for zooming)
    // Because there can be lines going to points outside of the visible area,
    // we actually prune to visible points, plus one on either side.
    if (dateWindow) {
      series = rolledSeries[i];
      var low = dateWindow[0];
      var high = dateWindow[1];

      // TODO(danvk): do binary search instead of linear search.
      // TODO(danvk): pass firstIdx and lastIdx directly to the renderer.
      var firstIdx = null, lastIdx = null;
      for (k = 0; k < series.length; k++) {
        if (series[k][0] >= low && firstIdx === null) {
          firstIdx = k;
        }
        if (series[k][0] <= high) {
          lastIdx = k;
        }
      }

      if (firstIdx === null) firstIdx = 0;
      var correctedFirstIdx = firstIdx;
      var isInvalidValue = true;
      while (isInvalidValue && correctedFirstIdx > 0) {
        correctedFirstIdx--;
        isInvalidValue = isValueNull(series[correctedFirstIdx]);
      }

      if (lastIdx === null) lastIdx = series.length - 1;
      var correctedLastIdx = lastIdx;
      isInvalidValue = true;
      while (isInvalidValue && correctedLastIdx < series.length - 1) {
        correctedLastIdx++;
        isInvalidValue = isValueNull(series[correctedLastIdx]);
      }


      if (correctedFirstIdx!==firstIdx) {
        firstIdx = correctedFirstIdx;
      }
      if (correctedLastIdx !== lastIdx) {
        lastIdx = correctedLastIdx;
      }
      
      boundaryIds[i-1] = [firstIdx, lastIdx];
      
      // .slice's end is exclusive, we want to include lastIdx.
      series = series.slice(firstIdx, lastIdx + 1);
    } else {
      series = rolledSeries[i];
      boundaryIds[i-1] = [0, series.length-1];
    }

    var seriesName = this.attr_("labels")[i];
    var seriesExtremes = this.extremeValues_(series);

    var seriesPoints = Dygraph.seriesToPoints_(
        series, bars, seriesName, boundaryIds[i-1][0]);

    if (this.attr_("stackedGraph")) {
      Dygraph.stackPoints_(seriesPoints, cumulativeYval, seriesExtremes,
                           this.attr_("stackedGraphNaNFill"));
    }

    extremes[seriesName] = seriesExtremes;
    points[i] = seriesPoints;
  }

  return { points: points, extremes: extremes, boundaryIds: boundaryIds };
};

/**
 * Update the graph with new data. This method is called when the viewing area
 * has changed. If the underlying data or options have changed, predraw_ will
 * be called before drawGraph_ is called.
 *
 * @private
 */
Dygraph.prototype.drawGraph_ = function() {
  var start = new Date();

  // This is used to set the second parameter to drawCallback, below.
  var is_initial_draw = this.is_initial_draw_;
  this.is_initial_draw_ = false;

  this.layout_.removeAllDatasets();
  this.setColors_();
  this.attrs_.pointSize = 0.5 * this.attr_('highlightCircleSize');

  var packed = this.gatherDatasets_(this.rolledSeries_, this.dateWindow_);
  var points = packed.points;
  var extremes = packed.extremes;
  this.boundaryIds_ = packed.boundaryIds;

  this.setIndexByName_ = {};
  var labels = this.attr_("labels");
  if (labels.length > 0) {
    this.setIndexByName_[labels[0]] = 0;
  }
  var dataIdx = 0;
  for (var i = 1; i < points.length; i++) {
    this.setIndexByName_[labels[i]] = i;
    if (!this.visibility()[i - 1]) continue;
    this.layout_.addDataset(labels[i], points[i]);
    this.datasetIndex_[i] = dataIdx++;
  }

  this.computeYAxisRanges_(extremes);
  this.layout_.setYAxes(this.axes_);

  this.addXTicks_();

  // Save the X axis zoomed status as the updateOptions call will tend to set it erroneously
  var tmp_zoomed_x = this.zoomed_x_;
  // Tell PlotKit to use this new data and render itself
  this.zoomed_x_ = tmp_zoomed_x;
  this.layout_.evaluate();
  this.renderGraph_(is_initial_draw);

  if (this.attr_("timingName")) {
    var end = new Date();
    Dygraph.info(this.attr_("timingName") + " - drawGraph: " + (end - start) + "ms");
  }
};

/**
 * This does the work of drawing the chart. It assumes that the layout and axis
 * scales have already been set (e.g. by predraw_).
 *
 * @private
 */
Dygraph.prototype.renderGraph_ = function(is_initial_draw) {
  this.cascadeEvents_('clearChart');
  this.plotter_.clear();

  if (this.attr_('underlayCallback')) {
    // NOTE: we pass the dygraph object to this callback twice to avoid breaking
    // users who expect a deprecated form of this callback.
    this.attr_('underlayCallback')(
        this.hidden_ctx_, this.layout_.getPlotArea(), this, this);
  }

  var e = {
    canvas: this.hidden_,
    drawingContext: this.hidden_ctx_
  };
  this.cascadeEvents_('willDrawChart', e);
  this.plotter_.render();
  this.cascadeEvents_('didDrawChart', e);
  this.lastRow_ = -1;  // because plugins/legend.js clears the legend

  // TODO(danvk): is this a performance bottleneck when panning?
  // The interaction canvas should already be empty in that situation.
  this.canvas_.getContext('2d').clearRect(0, 0, this.canvas_.width,
                                          this.canvas_.height);

  if (this.attr_("drawCallback") !== null) {
    this.attr_("drawCallback")(this, is_initial_draw);
  }
  if (is_initial_draw) {
    this.readyFired_ = true;
    while (this.readyFns_.length > 0) {
      var fn = this.readyFns_.pop();
      fn(this);
    }
  }
};

/**
 * @private
 * Determine properties of the y-axes which are independent of the data
 * currently being displayed. This includes things like the number of axes and
 * the style of the axes. It does not include the range of each axis and its
 * tick marks.
 * This fills in this.axes_.
 * axes_ = [ { options } ]
 *   indices are into the axes_ array.
 */
Dygraph.prototype.computeYAxes_ = function() {
  // Preserve valueWindow settings if they exist, and if the user hasn't
  // specified a new valueRange.
  var valueWindows, axis, index, opts, v;
  if (this.axes_ !== undefined && this.user_attrs_.hasOwnProperty("valueRange") === false) {
    valueWindows = [];
    for (index = 0; index < this.axes_.length; index++) {
      valueWindows.push(this.axes_[index].valueWindow);
    }
  }

  // this.axes_ doesn't match this.attributes_.axes_.options. It's used for
  // data computation as well as options storage.
  // Go through once and add all the axes.
  this.axes_ = [];

  for (axis = 0; axis < this.attributes_.numAxes(); axis++) {
    // Add a new axis, making a copy of its per-axis options.
    opts = { g : this };
    Dygraph.update(opts, this.attributes_.axisOptions(axis));
    this.axes_[axis] = opts;
  }


  // Copy global valueRange option over to the first axis.
  // NOTE(konigsberg): Are these two statements necessary?
  // I tried removing it. The automated tests pass, and manually
  // messing with tests/zoom.html showed no trouble.
  v = this.attr_('valueRange');
  if (v) this.axes_[0].valueRange = v;

  if (valueWindows !== undefined) {
    // Restore valueWindow settings.

    // When going from two axes back to one, we only restore
    // one axis.
    var idxCount = Math.min(valueWindows.length, this.axes_.length);

    for (index = 0; index < idxCount; index++) {
      this.axes_[index].valueWindow = valueWindows[index];
    }
  }

  for (axis = 0; axis < this.axes_.length; axis++) {
    if (axis === 0) {
      opts = this.optionsViewForAxis_('y' + (axis ? '2' : ''));
      v = opts("valueRange");
      if (v) this.axes_[axis].valueRange = v;
    } else {  // To keep old behavior
      var axes = this.user_attrs_.axes;
      if (axes && axes.y2) {
        v = axes.y2.valueRange;
        if (v) this.axes_[axis].valueRange = v;
      }
    }
  }
};

/**
 * Returns the number of y-axes on the chart.
 * @return {Number} the number of axes.
 */
Dygraph.prototype.numAxes = function() {
  return this.attributes_.numAxes();
};

/**
 * @private
 * Returns axis properties for the given series.
 * @param { String } setName The name of the series for which to get axis
 * properties, e.g. 'Y1'.
 * @return { Object } The axis properties.
 */
Dygraph.prototype.axisPropertiesForSeries = function(series) {
  // TODO(danvk): handle errors.
  return this.axes_[this.attributes_.axisForSeries(series)];
};

/**
 * @private
 * Determine the value range and tick marks for each axis.
 * @param {Object} extremes A mapping from seriesName -> [low, high]
 * This fills in the valueRange and ticks fields in each entry of this.axes_.
 */
Dygraph.prototype.computeYAxisRanges_ = function(extremes) {
  var isNullUndefinedOrNaN = function(num) {
    return isNaN(parseFloat(num));
  };
  var numAxes = this.attributes_.numAxes();
  var ypadCompat, span, series, ypad;
  
  var p_axis;

  // Compute extreme values, a span and tick marks for each axis.
  for (var i = 0; i < numAxes; i++) {
    var axis = this.axes_[i];
    var logscale = this.attributes_.getForAxis("logscale", i);
    var includeZero = this.attributes_.getForAxis("includeZero", i);
    var independentTicks = this.attributes_.getForAxis("independentTicks", i);
    series = this.attributes_.seriesForAxis(i);

    // Add some padding. This supports two Y padding operation modes:
    //
    // - backwards compatible (yRangePad not set):
    //   10% padding for automatic Y ranges, but not for user-supplied
    //   ranges, and move a close-to-zero edge to zero except if
    //   avoidMinZero is set, since drawing at the edge results in
    //   invisible lines. Unfortunately lines drawn at the edge of a
    //   user-supplied range will still be invisible. If logscale is
    //   set, add a variable amount of padding at the top but
    //   none at the bottom.
    //
    // - new-style (yRangePad set by the user):
    //   always add the specified Y padding.
    //
    ypadCompat = true;
    ypad = 0.1; // add 10%
    if (this.attr_('yRangePad') !== null) {
      ypadCompat = false;
      // Convert pixel padding to ratio
      ypad = this.attr_('yRangePad') / this.plotter_.area.h;
    }

    if (series.length === 0) {
      // If no series are defined or visible then use a reasonable default
      axis.extremeRange = [0, 1];
    } else {
      // Calculate the extremes of extremes.
      var minY = Infinity;  // extremes[series[0]][0];
      var maxY = -Infinity;  // extremes[series[0]][1];
      var extremeMinY, extremeMaxY;

      for (var j = 0; j < series.length; j++) {
        // this skips invisible series
        if (!extremes.hasOwnProperty(series[j])) continue;

        // Only use valid extremes to stop null data series' from corrupting the scale.
        extremeMinY = extremes[series[j]][0];
        if (extremeMinY !== null) {
          minY = Math.min(extremeMinY, minY);
        }
        extremeMaxY = extremes[series[j]][1];
        if (extremeMaxY !== null) {
          maxY = Math.max(extremeMaxY, maxY);
        }
      }

      // Include zero if requested by the user.
      if (includeZero && !logscale) {
        if (minY > 0) minY = 0;
        if (maxY < 0) maxY = 0;
      }

      // Ensure we have a valid scale, otherwise default to [0, 1] for safety.
      if (minY == Infinity) minY = 0;
      if (maxY == -Infinity) maxY = 1;

      span = maxY - minY;
      // special case: if we have no sense of scale, center on the sole value.
      if (span === 0) {
        if (maxY !== 0) {
          span = Math.abs(maxY);
        } else {
          // ... and if the sole value is zero, use range 0-1.
          maxY = 1;
          span = 1;
        }
      }

      var maxAxisY, minAxisY;
      if (logscale) {
        if (ypadCompat) {
          maxAxisY = maxY + ypad * span;
          minAxisY = minY;
        } else {
          var logpad = Math.exp(Math.log(span) * ypad);
          maxAxisY = maxY * logpad;
          minAxisY = minY / logpad;
        }
      } else {
        maxAxisY = maxY + ypad * span;
        minAxisY = minY - ypad * span;

        // Backwards-compatible behavior: Move the span to start or end at zero if it's
        // close to zero, but not if avoidMinZero is set.
        if (ypadCompat && !this.attr_("avoidMinZero")) {
          if (minAxisY < 0 && minY >= 0) minAxisY = 0;
          if (maxAxisY > 0 && maxY <= 0) maxAxisY = 0;
        }
      }
      axis.extremeRange = [minAxisY, maxAxisY];
    }
    if (axis.valueWindow) {
      // This is only set if the user has zoomed on the y-axis. It is never set
      // by a user. It takes precedence over axis.valueRange because, if you set
      // valueRange, you'd still expect to be able to pan.
      axis.computedValueRange = [axis.valueWindow[0], axis.valueWindow[1]];
    } else if (axis.valueRange) {
      // This is a user-set value range for this axis.
      var y0 = isNullUndefinedOrNaN(axis.valueRange[0]) ? axis.extremeRange[0] : axis.valueRange[0];
      var y1 = isNullUndefinedOrNaN(axis.valueRange[1]) ? axis.extremeRange[1] : axis.valueRange[1];
      if (!ypadCompat) {
        if (axis.logscale) {
          var logpad = Math.exp(Math.log(span) * ypad);
          y0 *= logpad;
          y1 /= logpad;
        } else {
          span = y1 - y0;
          y0 -= span * ypad;
          y1 += span * ypad;
        }
      }
      axis.computedValueRange = [y0, y1];
    } else {
      axis.computedValueRange = axis.extremeRange;
    }
    
    
    if (independentTicks) {
      axis.independentTicks = independentTicks;
      var opts = this.optionsViewForAxis_('y' + (i ? '2' : ''));
      var ticker = opts('ticker');
      axis.ticks = ticker(axis.computedValueRange[0],
              axis.computedValueRange[1],
              this.height_,  // TODO(danvk): should be area.height
              opts,
              this);
      // Define the first independent axis as primary axis.
      if (!p_axis) p_axis = axis;
    }
  }
  if (p_axis === undefined) {
    throw ("Configuration Error: At least one axis has to have the \"independentTicks\" option activated.");
  }
  // Add ticks. By default, all axes inherit the tick positions of the
  // primary axis. However, if an axis is specifically marked as having
  // independent ticks, then that is permissible as well.
  for (var i = 0; i < numAxes; i++) {
    var axis = this.axes_[i];
    
    if (!axis.independentTicks) {
      var opts = this.optionsViewForAxis_('y' + (i ? '2' : ''));
      var ticker = opts('ticker');
      var p_ticks = p_axis.ticks;
      var p_scale = p_axis.computedValueRange[1] - p_axis.computedValueRange[0];
      var scale = axis.computedValueRange[1] - axis.computedValueRange[0];
      var tick_values = [];
      for (var k = 0; k < p_ticks.length; k++) {
        var y_frac = (p_ticks[k].v - p_axis.computedValueRange[0]) / p_scale;
        var y_val = axis.computedValueRange[0] + y_frac * scale;
        tick_values.push(y_val);
      }

      axis.ticks = ticker(axis.computedValueRange[0],
                          axis.computedValueRange[1],
                          this.height_,  // TODO(danvk): should be area.height
                          opts,
                          this,
                          tick_values);
    }
  }
};

/**
 * Extracts one series from the raw data (a 2D array) into an array of (date,
 * value) tuples.
 *
 * This is where undesirable points (i.e. negative values on log scales and
 * missing values through which we wish to connect lines) are dropped.
 * TODO(danvk): the "missing values" bit above doesn't seem right.
 *
 * @private
 * @param {Array.<Array.<(number|Array<Number>)>>} rawData Input data. Rectangular
 *     grid of points, where rawData[row][0] is the X value for the row,
 *     and rawData[row][i] is the Y data for series #i.
 * @param {number} i Series index, starting from 1.
 * @param {boolean} logScale True if using logarithmic Y scale.
 * @return {Array.<Array.<(?number|Array<?number>)>} Series array, where
 *     series[row] = [x,y] or [x, [y, err]] or [x, [y, yplus, yminus]].
 */
Dygraph.prototype.extractSeries_ = function(rawData, i, logScale) {
  // TODO(danvk): pre-allocate series here.
  var series = [];
  var errorBars = this.attr_("errorBars");
  var customBars =  this.attr_("customBars");
  for (var j = 0; j < rawData.length; j++) {
    var x = rawData[j][0];
    var point = rawData[j][i];
    if (logScale) {
      // On the log scale, points less than zero do not exist.
      // This will create a gap in the chart.
      if (errorBars || customBars) {
        // point.length is either 2 (errorBars) or 3 (customBars)
        for (var k = 0; k < point.length; k++) {
          if (point[k] <= 0) {
            point = null;
            break;
          }
        }
      } else if (point <= 0) {
        point = null;
      }
    }
    // Fix null points to fit the display type standard.
    if (point !== null) {
      series.push([x, point]);
    } else {
      series.push([x, errorBars ? [null, null] : customBars ? [null, null, null] : point]);
    }
  }
  return series;
};

/**
 * @private
 * Calculates the rolling average of a data set.
 * If originalData is [label, val], rolls the average of those.
 * If originalData is [label, [, it's interpreted as [value, stddev]
 *   and the roll is returned in the same form, with appropriately reduced
 *   stddev for each value.
 * Note that this is where fractional input (i.e. '5/10') is converted into
 *   decimal values.
 * @param {Array} originalData The data in the appropriate format (see above)
 * @param {Number} rollPeriod The number of points over which to average the
 *                            data
 */
Dygraph.prototype.rollingAverage = function(originalData, rollPeriod) {
  rollPeriod = Math.min(rollPeriod, originalData.length);
  var rollingData = [];
  var sigma = this.attr_("sigma");

  var low, high, i, j, y, sum, num_ok, stddev;
  if (this.fractions_) {
    var num = 0;
    var den = 0;  // numerator/denominator
    var mult = 100.0;
    for (i = 0; i < originalData.length; i++) {
      num += originalData[i][1][0];
      den += originalData[i][1][1];
      if (i - rollPeriod >= 0) {
        num -= originalData[i - rollPeriod][1][0];
        den -= originalData[i - rollPeriod][1][1];
      }

      var date = originalData[i][0];
      var value = den ? num / den : 0.0;
      if (this.attr_("errorBars")) {
        if (this.attr_("wilsonInterval")) {
          // For more details on this confidence interval, see:
          // http://en.wikipedia.org/wiki/Binomial_confidence_interval
          if (den) {
            var p = value < 0 ? 0 : value, n = den;
            var pm = sigma * Math.sqrt(p*(1-p)/n + sigma*sigma/(4*n*n));
            var denom = 1 + sigma * sigma / den;
            low  = (p + sigma * sigma / (2 * den) - pm) / denom;
            high = (p + sigma * sigma / (2 * den) + pm) / denom;
            rollingData[i] = [date,
                              [p * mult, (p - low) * mult, (high - p) * mult]];
          } else {
            rollingData[i] = [date, [0, 0, 0]];
          }
        } else {
          stddev = den ? sigma * Math.sqrt(value * (1 - value) / den) : 1.0;
          rollingData[i] = [date, [mult * value, mult * stddev, mult * stddev]];
        }
      } else {
        rollingData[i] = [date, mult * value];
      }
    }
  } else if (this.attr_("customBars")) {
    low = 0;
    var mid = 0;
    high = 0;
    var count = 0;
    for (i = 0; i < originalData.length; i++) {
      var data = originalData[i][1];
      y = data[1];
      rollingData[i] = [originalData[i][0], [y, y - data[0], data[2] - y]];

      if (y !== null && !isNaN(y)) {
        low += data[0];
        mid += y;
        high += data[2];
        count += 1;
      }
      if (i - rollPeriod >= 0) {
        var prev = originalData[i - rollPeriod];
        if (prev[1][1] !== null && !isNaN(prev[1][1])) {
          low -= prev[1][0];
          mid -= prev[1][1];
          high -= prev[1][2];
          count -= 1;
        }
      }
      if (count) {
        rollingData[i] = [originalData[i][0], [ 1.0 * mid / count,
                                                1.0 * (mid - low) / count,
                                                1.0 * (high - mid) / count ]];
      } else {
        rollingData[i] = [originalData[i][0], [null, null, null]];
      }
    }
  } else {
    // Calculate the rolling average for the first rollPeriod - 1 points where
    // there is not enough data to roll over the full number of points
    if (!this.attr_("errorBars")) {
      if (rollPeriod == 1) {
        return originalData;
      }

      for (i = 0; i < originalData.length; i++) {
        sum = 0;
        num_ok = 0;
        for (j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
          y = originalData[j][1];
          if (y === null || isNaN(y)) continue;
          num_ok++;
          sum += originalData[j][1];
        }
        if (num_ok) {
          rollingData[i] = [originalData[i][0], sum / num_ok];
        } else {
          rollingData[i] = [originalData[i][0], null];
        }
      }

    } else {
      for (i = 0; i < originalData.length; i++) {
        sum = 0;
        var variance = 0;
        num_ok = 0;
        for (j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
          y = originalData[j][1][0];
          if (y === null || isNaN(y)) continue;
          num_ok++;
          sum += originalData[j][1][0];
          variance += Math.pow(originalData[j][1][1], 2);
        }
        if (num_ok) {
          stddev = Math.sqrt(variance) / num_ok;
          rollingData[i] = [originalData[i][0],
                            [sum / num_ok, sigma * stddev, sigma * stddev]];
        } else {
          // This explicitly preserves NaNs to aid with "independent series".
          // See testRollingAveragePreservesNaNs.
          var v = (rollPeriod == 1) ? originalData[i][1][0] : null;
          rollingData[i] = [originalData[i][0], [v, v, v]];
        }
      }
    }
  }

  return rollingData;
};

/**
 * Detects the type of the str (date or numeric) and sets the various
 * formatting attributes in this.attrs_ based on this type.
 * @param {String} str An x value.
 * @private
 */
Dygraph.prototype.detectTypeFromString_ = function(str) {
  var isDate = false;
  var dashPos = str.indexOf('-');  // could be 2006-01-01 _or_ 1.0e-2
  if ((dashPos > 0 && (str[dashPos-1] != 'e' && str[dashPos-1] != 'E')) ||
      str.indexOf('/') >= 0 ||
      isNaN(parseFloat(str))) {
    isDate = true;
  } else if (str.length == 8 && str > '19700101' && str < '20371231') {
    // TODO(danvk): remove support for this format.
    isDate = true;
  }

  this.setXAxisOptions_(isDate);
};

Dygraph.prototype.setXAxisOptions_ = function(isDate) {
  if (isDate) {
    this.attrs_.xValueParser = Dygraph.dateParser;
    this.attrs_.axes.x.valueFormatter = Dygraph.dateString_;
    this.attrs_.axes.x.ticker = Dygraph.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = Dygraph.dateAxisFormatter;
  } else {
    /** @private (shut up, jsdoc!) */
    this.attrs_.xValueParser = function(x) { return parseFloat(x); };
    // TODO(danvk): use Dygraph.numberValueFormatter here?
    /** @private (shut up, jsdoc!) */
    this.attrs_.axes.x.valueFormatter = function(x) { return x; };
    this.attrs_.axes.x.ticker = Dygraph.numericLinearTicks;
    this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
  }
};

/**
 * Parses the value as a floating point number. This is like the parseFloat()
 * built-in, but with a few differences:
 * - the empty string is parsed as null, rather than NaN.
 * - if the string cannot be parsed at all, an error is logged.
 * If the string can't be parsed, this method returns null.
 * @param {String} x The string to be parsed
 * @param {Number} opt_line_no The line number from which the string comes.
 * @param {String} opt_line The text of the line from which the string comes.
 * @private
 */

// Parse the x as a float or return null if it's not a number.
Dygraph.prototype.parseFloat_ = function(x, opt_line_no, opt_line) {
  var val = parseFloat(x);
  if (!isNaN(val)) return val;

  // Try to figure out what happeend.
  // If the value is the empty string, parse it as null.
  if (/^ *$/.test(x)) return null;

  // If it was actually "NaN", return it as NaN.
  if (/^ *nan *$/i.test(x)) return NaN;

  // Looks like a parsing error.
  var msg = "Unable to parse '" + x + "' as a number";
  if (opt_line !== null && opt_line_no !== null) {
    msg += " on line " + (1+opt_line_no) + " ('" + opt_line + "') of CSV.";
  }
  this.error(msg);

  return null;
};

/**
 * @private
 * Parses a string in a special csv format.  We expect a csv file where each
 * line is a date point, and the first field in each line is the date string.
 * We also expect that all remaining fields represent series.
 * if the errorBars attribute is set, then interpret the fields as:
 * date, series1, stddev1, series2, stddev2, ...
 * @param {[Object]} data See above.
 *
 * @return [Object] An array with one entry for each row. These entries
 * are an array of cells in that row. The first entry is the parsed x-value for
 * the row. The second, third, etc. are the y-values. These can take on one of
 * three forms, depending on the CSV and constructor parameters:
 * 1. numeric value
 * 2. [ value, stddev ]
 * 3. [ low value, center value, high value ]
 */
Dygraph.prototype.parseCSV_ = function(data) {
  var ret = [];
  var line_delimiter = Dygraph.detectLineDelimiter(data);
  var lines = data.split(line_delimiter || "\n");
  var vals, j;

  // Use the default delimiter or fall back to a tab if that makes sense.
  var delim = this.attr_('delimiter');
  if (lines[0].indexOf(delim) == -1 && lines[0].indexOf('\t') >= 0) {
    delim = '\t';
  }

  var start = 0;
  if (!('labels' in this.user_attrs_)) {
    // User hasn't explicitly set labels, so they're (presumably) in the CSV.
    start = 1;
    this.attrs_.labels = lines[0].split(delim);  // NOTE: _not_ user_attrs_.
    this.attributes_.reparseSeries();
  }
  var line_no = 0;

  var xParser;
  var defaultParserSet = false;  // attempt to auto-detect x value type
  var expectedCols = this.attr_("labels").length;
  var outOfOrder = false;
  for (var i = start; i < lines.length; i++) {
    var line = lines[i];
    line_no = i;
    if (line.length === 0) continue;  // skip blank lines
    if (line[0] == '#') continue;    // skip comment lines
    var inFields = line.split(delim);
    if (inFields.length < 2) continue;

    var fields = [];
    if (!defaultParserSet) {
      this.detectTypeFromString_(inFields[0]);
      xParser = this.attr_("xValueParser");
      defaultParserSet = true;
    }
    fields[0] = xParser(inFields[0], this);

    // If fractions are expected, parse the numbers as "A/B"
    if (this.fractions_) {
      for (j = 1; j < inFields.length; j++) {
        // TODO(danvk): figure out an appropriate way to flag parse errors.
        vals = inFields[j].split("/");
        if (vals.length != 2) {
          this.error('Expected fractional "num/den" values in CSV data ' +
                     "but found a value '" + inFields[j] + "' on line " +
                     (1 + i) + " ('" + line + "') which is not of this form.");
          fields[j] = [0, 0];
        } else {
          fields[j] = [this.parseFloat_(vals[0], i, line),
                       this.parseFloat_(vals[1], i, line)];
        }
      }
    } else if (this.attr_("errorBars")) {
      // If there are error bars, values are (value, stddev) pairs
      if (inFields.length % 2 != 1) {
        this.error('Expected alternating (value, stdev.) pairs in CSV data ' +
                   'but line ' + (1 + i) + ' has an odd number of values (' +
                   (inFields.length - 1) + "): '" + line + "'");
      }
      for (j = 1; j < inFields.length; j += 2) {
        fields[(j + 1) / 2] = [this.parseFloat_(inFields[j], i, line),
                               this.parseFloat_(inFields[j + 1], i, line)];
      }
    } else if (this.attr_("customBars")) {
      // Bars are a low;center;high tuple
      for (j = 1; j < inFields.length; j++) {
        var val = inFields[j];
        if (/^ *$/.test(val)) {
          fields[j] = [null, null, null];
        } else {
          vals = val.split(";");
          if (vals.length == 3) {
            fields[j] = [ this.parseFloat_(vals[0], i, line),
                          this.parseFloat_(vals[1], i, line),
                          this.parseFloat_(vals[2], i, line) ];
          } else {
            this.warn('When using customBars, values must be either blank ' +
                      'or "low;center;high" tuples (got "' + val +
                      '" on line ' + (1+i));
          }
        }
      }
    } else {
      // Values are just numbers
      for (j = 1; j < inFields.length; j++) {
        fields[j] = this.parseFloat_(inFields[j], i, line);
      }
    }
    if (ret.length > 0 && fields[0] < ret[ret.length - 1][0]) {
      outOfOrder = true;
    }

    if (fields.length != expectedCols) {
      this.error("Number of columns in line " + i + " (" + fields.length +
                 ") does not agree with number of labels (" + expectedCols +
                 ") " + line);
    }

    // If the user specified the 'labels' option and none of the cells of the
    // first row parsed correctly, then they probably double-specified the
    // labels. We go with the values set in the option, discard this row and
    // log a warning to the JS console.
    if (i === 0 && this.attr_('labels')) {
      var all_null = true;
      for (j = 0; all_null && j < fields.length; j++) {
        if (fields[j]) all_null = false;
      }
      if (all_null) {
        this.warn("The dygraphs 'labels' option is set, but the first row of " +
                  "CSV data ('" + line + "') appears to also contain labels. " +
                  "Will drop the CSV labels and use the option labels.");
        continue;
      }
    }
    ret.push(fields);
  }

  if (outOfOrder) {
    this.warn("CSV is out of order; order it correctly to speed loading.");
    ret.sort(function(a,b) { return a[0] - b[0]; });
  }

  return ret;
};

/**
 * @private
 * The user has provided their data as a pre-packaged JS array. If the x values
 * are numeric, this is the same as dygraphs' internal format. If the x values
 * are dates, we need to convert them from Date objects to ms since epoch.
 * @param {[Object]} data
 * @return {[Object]} data with numeric x values.
 */
Dygraph.prototype.parseArray_ = function(data) {
  // Peek at the first x value to see if it's numeric.
  if (data.length === 0) {
    this.error("Can't plot empty data set");
    return null;
  }
  if (data[0].length === 0) {
    this.error("Data set cannot contain an empty row");
    return null;
  }

  var i;
  if (this.attr_("labels") === null) {
    this.warn("Using default labels. Set labels explicitly via 'labels' " +
              "in the options parameter");
    this.attrs_.labels = [ "X" ];
    for (i = 1; i < data[0].length; i++) {
      this.attrs_.labels.push("Y" + i); // Not user_attrs_.
    }
    this.attributes_.reparseSeries();
  } else {
    var num_labels = this.attr_("labels");
    if (num_labels.length != data[0].length) {
      this.error("Mismatch between number of labels (" + num_labels +
          ") and number of columns in array (" + data[0].length + ")");
      return null;
    }
  }

  if (Dygraph.isDateLike(data[0][0])) {
    // Some intelligent defaults for a date x-axis.
    this.attrs_.axes.x.valueFormatter = Dygraph.dateString_;
    this.attrs_.axes.x.ticker = Dygraph.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = Dygraph.dateAxisFormatter;

    // Assume they're all dates.
    var parsedData = Dygraph.clone(data);
    for (i = 0; i < data.length; i++) {
      if (parsedData[i].length === 0) {
        this.error("Row " + (1 + i) + " of data is empty");
        return null;
      }
      if (parsedData[i][0] === null ||
          typeof(parsedData[i][0].getTime) != 'function' ||
          isNaN(parsedData[i][0].getTime())) {
        this.error("x value in row " + (1 + i) + " is not a Date");
        return null;
      }
      parsedData[i][0] = parsedData[i][0].getTime();
    }
    return parsedData;
  } else {
    // Some intelligent defaults for a numeric x-axis.
    /** @private (shut up, jsdoc!) */
    this.attrs_.axes.x.valueFormatter = function(x) { return x; };
    this.attrs_.axes.x.ticker = Dygraph.numericLinearTicks;
    this.attrs_.axes.x.axisLabelFormatter = Dygraph.numberAxisLabelFormatter;
    return data;
  }
};

/**
 * Parses a DataTable object from gviz.
 * The data is expected to have a first column that is either a date or a
 * number. All subsequent columns must be numbers. If there is a clear mismatch
 * between this.xValueParser_ and the type of the first column, it will be
 * fixed. Fills out rawData_.
 * @param {[Object]} data See above.
 * @private
 */
Dygraph.prototype.parseDataTable_ = function(data) {
  var shortTextForAnnotationNum = function(num) {
    // converts [0-9]+ [A-Z][a-z]*
    // example: 0=A, 1=B, 25=Z, 26=Aa, 27=Ab
    // and continues like.. Ba Bb .. Za .. Zz..Aaa...Zzz Aaaa Zzzz
    var shortText = String.fromCharCode(65 /* A */ + num % 26);
    num = Math.floor(num / 26);
    while ( num > 0 ) {
      shortText = String.fromCharCode(65 /* A */ + (num - 1) % 26 ) + shortText.toLowerCase();
      num = Math.floor((num - 1) / 26);
    }
    return shortText;
  };

  var cols = data.getNumberOfColumns();
  var rows = data.getNumberOfRows();

  var indepType = data.getColumnType(0);
  if (indepType == 'date' || indepType == 'datetime') {
    this.attrs_.xValueParser = Dygraph.dateParser;
    this.attrs_.axes.x.valueFormatter = Dygraph.dateString_;
    this.attrs_.axes.x.ticker = Dygraph.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = Dygraph.dateAxisFormatter;
  } else if (indepType == 'number') {
    this.attrs_.xValueParser = function(x) { return parseFloat(x); };
    this.attrs_.axes.x.valueFormatter = function(x) { return x; };
    this.attrs_.axes.x.ticker = Dygraph.numericLinearTicks;
    this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
  } else {
    this.error("only 'date', 'datetime' and 'number' types are supported for " +
               "column 1 of DataTable input (Got '" + indepType + "')");
    return null;
  }

  // Array of the column indices which contain data (and not annotations).
  var colIdx = [];
  var annotationCols = {};  // data index -> [annotation cols]
  var hasAnnotations = false;
  var i, j;
  for (i = 1; i < cols; i++) {
    var type = data.getColumnType(i);
    if (type == 'number') {
      colIdx.push(i);
    } else if (type == 'string' && this.attr_('displayAnnotations')) {
      // This is OK -- it's an annotation column.
      var dataIdx = colIdx[colIdx.length - 1];
      if (!annotationCols.hasOwnProperty(dataIdx)) {
        annotationCols[dataIdx] = [i];
      } else {
        annotationCols[dataIdx].push(i);
      }
      hasAnnotations = true;
    } else {
      this.error("Only 'number' is supported as a dependent type with Gviz." +
                 " 'string' is only supported if displayAnnotations is true");
    }
  }

  // Read column labels
  // TODO(danvk): add support back for errorBars
  var labels = [data.getColumnLabel(0)];
  for (i = 0; i < colIdx.length; i++) {
    labels.push(data.getColumnLabel(colIdx[i]));
    if (this.attr_("errorBars")) i += 1;
  }
  this.attrs_.labels = labels;
  cols = labels.length;

  var ret = [];
  var outOfOrder = false;
  var annotations = [];
  for (i = 0; i < rows; i++) {
    var row = [];
    if (typeof(data.getValue(i, 0)) === 'undefined' ||
        data.getValue(i, 0) === null) {
      this.warn("Ignoring row " + i +
                " of DataTable because of undefined or null first column.");
      continue;
    }

    if (indepType == 'date' || indepType == 'datetime') {
      row.push(data.getValue(i, 0).getTime());
    } else {
      row.push(data.getValue(i, 0));
    }
    if (!this.attr_("errorBars")) {
      for (j = 0; j < colIdx.length; j++) {
        var col = colIdx[j];
        row.push(data.getValue(i, col));
        if (hasAnnotations &&
            annotationCols.hasOwnProperty(col) &&
            data.getValue(i, annotationCols[col][0]) !== null) {
          var ann = {};
          ann.series = data.getColumnLabel(col);
          ann.xval = row[0];
          ann.shortText = shortTextForAnnotationNum(annotations.length);
          ann.text = '';
          for (var k = 0; k < annotationCols[col].length; k++) {
            if (k) ann.text += "\n";
            ann.text += data.getValue(i, annotationCols[col][k]);
          }
          annotations.push(ann);
        }
      }

      // Strip out infinities, which give dygraphs problems later on.
      for (j = 0; j < row.length; j++) {
        if (!isFinite(row[j])) row[j] = null;
      }
    } else {
      for (j = 0; j < cols - 1; j++) {
        row.push([ data.getValue(i, 1 + 2 * j), data.getValue(i, 2 + 2 * j) ]);
      }
    }
    if (ret.length > 0 && row[0] < ret[ret.length - 1][0]) {
      outOfOrder = true;
    }
    ret.push(row);
  }

  if (outOfOrder) {
    this.warn("DataTable is out of order; order it correctly to speed loading.");
    ret.sort(function(a,b) { return a[0] - b[0]; });
  }
  this.rawData_ = ret;

  if (annotations.length > 0) {
    this.setAnnotations(annotations, true);
  }
  this.attributes_.reparseSeries();
};

/**
 * Get the CSV data. If it's in a function, call that function. If it's in a
 * file, do an XMLHttpRequest to get it.
 * @private
 */
Dygraph.prototype.start_ = function() {
  var data = this.file_;

  // Functions can return references of all other types.
  if (typeof data == 'function') {
    data = data();
  }

  if (Dygraph.isArrayLike(data)) {
    this.rawData_ = this.parseArray_(data);
    this.predraw_();
  } else if (typeof data == 'object' &&
             typeof data.getColumnRange == 'function') {
    // must be a DataTable from gviz.
    this.parseDataTable_(data);
    this.predraw_();
  } else if (typeof data == 'string') {
    // Heuristic: a newline means it's CSV data. Otherwise it's an URL.
    var line_delimiter = Dygraph.detectLineDelimiter(data);
    if (line_delimiter) {
      this.loadedEvent_(data);
    } else {
      // REMOVE_FOR_IE
      var req;
      if (window.XMLHttpRequest) {
        // Firefox, Opera, IE7, and other browsers will use the native object
        req = new XMLHttpRequest();
      } else {
        // IE 5 and 6 will use the ActiveX control
        req = new ActiveXObject("Microsoft.XMLHTTP");
      }

      var caller = this;
      req.onreadystatechange = function () {
        if (req.readyState == 4) {
          if (req.status === 200 ||  // Normal http
              req.status === 0) {    // Chrome w/ --allow-file-access-from-files
            caller.loadedEvent_(req.responseText);
          }
        }
      };

      req.open("GET", data, true);
      req.send(null);
    }
  } else {
    this.error("Unknown data format: " + (typeof data));
  }
};

/**
 * Changes various properties of the graph. These can include:
 * <ul>
 * <li>file: changes the source data for the graph</li>
 * <li>errorBars: changes whether the data contains stddev</li>
 * </ul>
 *
 * There's a huge variety of options that can be passed to this method. For a
 * full list, see http://dygraphs.com/options.html.
 *
 * @param {Object} attrs The new properties and values
 * @param {Boolean} [block_redraw] Usually the chart is redrawn after every
 * call to updateOptions(). If you know better, you can pass true to explicitly
 * block the redraw. This can be useful for chaining updateOptions() calls,
 * avoiding the occasional infinite loop and preventing redraws when it's not
 * necessary (e.g. when updating a callback).
 */
Dygraph.prototype.updateOptions = function(input_attrs, block_redraw) {
  if (typeof(block_redraw) == 'undefined') block_redraw = false;

  // mapLegacyOptions_ drops the "file" parameter as a convenience to us.
  var file = input_attrs.file;
  var attrs = Dygraph.mapLegacyOptions_(input_attrs);

  // TODO(danvk): this is a mess. Move these options into attr_.
  if ('rollPeriod' in attrs) {
    this.rollPeriod_ = attrs.rollPeriod;
  }
  if ('dateWindow' in attrs) {
    this.dateWindow_ = attrs.dateWindow;
    if (!('isZoomedIgnoreProgrammaticZoom' in attrs)) {
      this.zoomed_x_ = (attrs.dateWindow !== null);
    }
  }
  if ('valueRange' in attrs && !('isZoomedIgnoreProgrammaticZoom' in attrs)) {
    this.zoomed_y_ = (attrs.valueRange !== null);
  }

  // TODO(danvk): validate per-series options.
  // Supported:
  // strokeWidth
  // pointSize
  // drawPoints
  // highlightCircleSize

  // Check if this set options will require new points.
  var requiresNewPoints = Dygraph.isPixelChangingOptionList(this.attr_("labels"), attrs);

  Dygraph.updateDeep(this.user_attrs_, attrs);

  this.attributes_.reparseSeries();

  if (file) {
    this.file_ = file;
    if (!block_redraw) this.start_();
  } else {
    if (!block_redraw) {
      if (requiresNewPoints) {
        this.predraw_();
      } else {
        this.renderGraph_(false);
      }
    }
  }
};

/**
 * Returns a copy of the options with deprecated names converted into current
 * names. Also drops the (potentially-large) 'file' attribute. If the caller is
 * interested in that, they should save a copy before calling this.
 * @private
 */
Dygraph.mapLegacyOptions_ = function(attrs) {
  var my_attrs = {};
  for (var k in attrs) {
    if (k == 'file') continue;
    if (attrs.hasOwnProperty(k)) my_attrs[k] = attrs[k];
  }

  var set = function(axis, opt, value) {
    if (!my_attrs.axes) my_attrs.axes = {};
    if (!my_attrs.axes[axis]) my_attrs.axes[axis] = {};
    my_attrs.axes[axis][opt] = value;
  };
  var map = function(opt, axis, new_opt) {
    if (typeof(attrs[opt]) != 'undefined') {
      Dygraph.warn("Option " + opt + " is deprecated. Use the " +
          new_opt + " option for the " + axis + " axis instead. " +
          "(e.g. { axes : { " + axis + " : { " + new_opt + " : ... } } } " +
          "(see http://dygraphs.com/per-axis.html for more information.");
      set(axis, new_opt, attrs[opt]);
      delete my_attrs[opt];
    }
  };

  // This maps, e.g., xValueFormater -> axes: { x: { valueFormatter: ... } }
  map('xValueFormatter', 'x', 'valueFormatter');
  map('pixelsPerXLabel', 'x', 'pixelsPerLabel');
  map('xAxisLabelFormatter', 'x', 'axisLabelFormatter');
  map('xTicker', 'x', 'ticker');
  map('yValueFormatter', 'y', 'valueFormatter');
  map('pixelsPerYLabel', 'y', 'pixelsPerLabel');
  map('yAxisLabelFormatter', 'y', 'axisLabelFormatter');
  map('yTicker', 'y', 'ticker');
  return my_attrs;
};

/**
 * Resizes the dygraph. If no parameters are specified, resizes to fill the
 * containing div (which has presumably changed size since the dygraph was
 * instantiated. If the width/height are specified, the div will be resized.
 *
 * This is far more efficient than destroying and re-instantiating a
 * Dygraph, since it doesn't have to reparse the underlying data.
 *
 * @param {Number} [width] Width (in pixels)
 * @param {Number} [height] Height (in pixels)
 */
Dygraph.prototype.resize = function(width, height) {
  if (this.resize_lock) {
    return;
  }
  this.resize_lock = true;

  if ((width === null) != (height === null)) {
    this.warn("Dygraph.resize() should be called with zero parameters or " +
              "two non-NULL parameters. Pretending it was zero.");
    width = height = null;
  }

  var old_width = this.width_;
  var old_height = this.height_;

  if (width) {
    this.maindiv_.style.width = width + "px";
    this.maindiv_.style.height = height + "px";
    this.width_ = width;
    this.height_ = height;
  } else {
    this.width_ = this.maindiv_.clientWidth;
    this.height_ = this.maindiv_.clientHeight;
  }

  if (old_width != this.width_ || old_height != this.height_) {
    // Resizing a canvas erases it, even when the size doesn't change, so
    // any resize needs to be followed by a redraw.
    this.resizeElements_();
    this.predraw_();
  }

  this.resize_lock = false;
};

/**
 * Adjusts the number of points in the rolling average. Updates the graph to
 * reflect the new averaging period.
 * @param {Number} length Number of points over which to average the data.
 */
Dygraph.prototype.adjustRoll = function(length) {
  this.rollPeriod_ = length;
  this.predraw_();
};

/**
 * Returns a boolean array of visibility statuses.
 */
Dygraph.prototype.visibility = function() {
  // Do lazy-initialization, so that this happens after we know the number of
  // data series.
  if (!this.attr_("visibility")) {
    this.attrs_.visibility = [];
  }
  // TODO(danvk): it looks like this could go into an infinite loop w/ user_attrs.
  while (this.attr_("visibility").length < this.numColumns() - 1) {
    this.attrs_.visibility.push(true);
  }
  return this.attr_("visibility");
};

/**
 * Changes the visiblity of a series.
 */
Dygraph.prototype.setVisibility = function(num, value) {
  var x = this.visibility();
  if (num < 0 || num >= x.length) {
    this.warn("invalid series number in setVisibility: " + num);
  } else {
    x[num] = value;
    this.predraw_();
  }
};

/**
 * How large of an area will the dygraph render itself in?
 * This is used for testing.
 * @return A {width: w, height: h} object.
 * @private
 */
Dygraph.prototype.size = function() {
  return { width: this.width_, height: this.height_ };
};

/**
 * Update the list of annotations and redraw the chart.
 * See dygraphs.com/annotations.html for more info on how to use annotations.
 * @param ann {Array} An array of annotation objects.
 * @param suppressDraw {Boolean} Set to "true" to block chart redraw (optional).
 */
Dygraph.prototype.setAnnotations = function(ann, suppressDraw) {
  // Only add the annotation CSS rule once we know it will be used.
  Dygraph.addAnnotationRule();
  this.annotations_ = ann;
  if (!this.layout_) {
    this.warn("Tried to setAnnotations before dygraph was ready. " +
              "Try setting them in a ready() block. See " +
              "dygraphs.com/tests/annotation.html");
    return;
  }

  this.layout_.setAnnotations(this.annotations_);
  if (!suppressDraw) {
    this.predraw_();
  }
};

/**
 * Return the list of annotations.
 */
Dygraph.prototype.annotations = function() {
  return this.annotations_;
};

/**
 * Get the list of label names for this graph. The first column is the
 * x-axis, so the data series names start at index 1.
 *
 * Returns null when labels have not yet been defined.
 */
Dygraph.prototype.getLabels = function() {
  var labels = this.attr_("labels");
  return labels ? labels.slice() : null;
};

/**
 * Get the index of a series (column) given its name. The first column is the
 * x-axis, so the data series start with index 1.
 */
Dygraph.prototype.indexFromSetName = function(name) {
  return this.setIndexByName_[name];
};

/**
 * Trigger a callback when the dygraph has drawn itself and is ready to be
 * manipulated. This is primarily useful when dygraphs has to do an XHR for the
 * data (i.e. a URL is passed as the data source) and the chart is drawn
 * asynchronously. If the chart has already drawn, the callback will fire
 * immediately.
 *
 * This is a good place to call setAnnotation().
 *
 * @param {function(!Dygraph)} callback The callback to trigger when the chart
 *     is ready.
 */
Dygraph.prototype.ready = function(callback) {
  if (this.is_initial_draw_) {
    this.readyFns_.push(callback);
  } else {
    callback(this);
  }
};

/**
 * @private
 * Adds a default style for the annotation CSS classes to the document. This is
 * only executed when annotations are actually used. It is designed to only be
 * called once -- all calls after the first will return immediately.
 */
Dygraph.addAnnotationRule = function() {
  // TODO(danvk): move this function into plugins/annotations.js?
  if (Dygraph.addedAnnotationCSS) return;

  var rule = "border: 1px solid black; " +
             "background-color: white; " +
             "text-align: center;";

  var styleSheetElement = document.createElement("style");
  styleSheetElement.type = "text/css";
  document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

  // Find the first style sheet that we can access.
  // We may not add a rule to a style sheet from another domain for security
  // reasons. This sometimes comes up when using gviz, since the Google gviz JS
  // adds its own style sheets from google.com.
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].disabled) continue;
    var mysheet = document.styleSheets[i];
    try {
      if (mysheet.insertRule) {  // Firefox
        var idx = mysheet.cssRules ? mysheet.cssRules.length : 0;
        mysheet.insertRule(".dygraphDefaultAnnotation { " + rule + " }", idx);
      } else if (mysheet.addRule) {  // IE
        mysheet.addRule(".dygraphDefaultAnnotation", rule);
      }
      Dygraph.addedAnnotationCSS = true;
      return;
    } catch(err) {
      // Was likely a security exception.
    }
  }

  this.warn("Unable to add default annotation CSS rule; display may be off.");
};

// Older pages may still use this name.
var DateGraph = Dygraph;

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview This file contains utility functions used by dygraphs. These
 * are typically static (i.e. not related to any particular dygraph). Examples
 * include date/time formatting functions, basic algorithms (e.g. binary
 * search) and generic DOM-manipulation functions.
 */

/*jshint globalstrict: true */
/*global Dygraph:false, G_vmlCanvasManager:false, Node:false, printStackTrace: false */
"use strict";

Dygraph.LOG_SCALE = 10;
Dygraph.LN_TEN = Math.log(Dygraph.LOG_SCALE);

/**
 * @private
 * @param {number} x
 * @return {number}
 */
Dygraph.log10 = function(x) {
  return Math.log(x) / Dygraph.LN_TEN;
};

// Various logging levels.
Dygraph.DEBUG = 1;
Dygraph.INFO = 2;
Dygraph.WARNING = 3;
Dygraph.ERROR = 3;

// Set this to log stack traces on warnings, etc.
// This requires stacktrace.js, which is up to you to provide.
// A copy can be found in the dygraphs repo, or at
// https://github.com/eriwen/javascript-stacktrace
Dygraph.LOG_STACK_TRACES = false;

/** A dotted line stroke pattern. */
Dygraph.DOTTED_LINE = [2, 2];
/** A dashed line stroke pattern. */
Dygraph.DASHED_LINE = [7, 3];
/** A dot dash stroke pattern. */
Dygraph.DOT_DASH_LINE = [7, 2, 2, 2];

/**
 * Log an error on the JS console at the given severity.
 * @param {number} severity One of Dygraph.{DEBUG,INFO,WARNING,ERROR}
 * @param {string} message The message to log.
 * @private
 */
Dygraph.log = function(severity, message) {
  var st;
  if (typeof(printStackTrace) != 'undefined') {
    try {
      // Remove uninteresting bits: logging functions and paths.
      st = printStackTrace({guess:false});
      while (st[0].indexOf("stacktrace") != -1) {
        st.splice(0, 1);
      }

      st.splice(0, 2);
      for (var i = 0; i < st.length; i++) {
        st[i] = st[i].replace(/\([^)]*\/(.*)\)/, '@$1')
            .replace(/\@.*\/([^\/]*)/, '@$1')
            .replace('[object Object].', '');
      }
      var top_msg = st.splice(0, 1)[0];
      message += ' (' + top_msg.replace(/^.*@ ?/, '') + ')';
    } catch(e) {
      // Oh well, it was worth a shot!
    }
  }

  if (typeof(window.console) != 'undefined') {
    // In older versions of Firefox, only console.log is defined.
    var console = window.console;
    var log = function(console, method, msg) {
      if (method && typeof(method) == 'function') {
        method.call(console, msg);
      } else {
        console.log(msg);
      }
    };

    switch (severity) {
      case Dygraph.DEBUG:
        log(console, console.debug, 'dygraphs: ' + message);
        break;
      case Dygraph.INFO:
        log(console, console.info, 'dygraphs: ' + message);
        break;
      case Dygraph.WARNING:
        log(console, console.warn, 'dygraphs: ' + message);
        break;
      case Dygraph.ERROR:
        log(console, console.error, 'dygraphs: ' + message);
        break;
    }
  }

  if (Dygraph.LOG_STACK_TRACES) {
    window.console.log(st.join('\n'));
  }
};

/**
 * @param {string} message
 * @private
 */
Dygraph.info = function(message) {
  Dygraph.log(Dygraph.INFO, message);
};
/**
 * @param {string} message
 * @private
 */
Dygraph.prototype.info = Dygraph.info;

/**
 * @param {string} message
 * @private
 */
Dygraph.warn = function(message) {
  Dygraph.log(Dygraph.WARNING, message);
};
/**
 * @param {string} message
 * @private
 */
Dygraph.prototype.warn = Dygraph.warn;

/**
 * @param {string} message
 */
Dygraph.error = function(message) {
  Dygraph.log(Dygraph.ERROR, message);
};
/**
 * @param {string} message
 * @private
 */
Dygraph.prototype.error = Dygraph.error;

/**
 * Return the 2d context for a dygraph canvas.
 *
 * This method is only exposed for the sake of replacing the function in
 * automated tests, e.g.
 *
 * var oldFunc = Dygraph.getContext();
 * Dygraph.getContext = function(canvas) {
 *   var realContext = oldFunc(canvas);
 *   return new Proxy(realContext);
 * };
 * @param {!HTMLCanvasElement} canvas
 * @return {!CanvasRenderingContext2D}
 * @private
 */
Dygraph.getContext = function(canvas) {
  return /** @type{!CanvasRenderingContext2D}*/(canvas.getContext("2d"));
};

/**
 * Add an event handler. This smooths a difference between IE and the rest of
 * the world.
 * @param { !Element } elem The element to add the event to.
 * @param { string } type The type of the event, e.g. 'click' or 'mousemove'.
 * @param { function(Event):(boolean|undefined) } fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
Dygraph.addEvent = function addEvent(elem, type, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(type, fn, false);
  } else {
    elem[type+fn] = function(){fn(window.event);};
    elem.attachEvent('on'+type, elem[type+fn]);
  }
};

/**
 * Add an event handler. This event handler is kept until the graph is
 * destroyed with a call to graph.destroy().
 *
 * @param { !Element } elem The element to add the event to.
 * @param { string } type The type of the event, e.g. 'click' or 'mousemove'.
 * @param { function(Event):(boolean|undefined) } fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
Dygraph.prototype.addAndTrackEvent = function(elem, type, fn) {
  Dygraph.addEvent(elem, type, fn);
  this.registeredEvents_.push({ elem : elem, type : type, fn : fn });
};

/**
 * Remove an event handler. This smooths a difference between IE and the rest
 * of the world.
 * @param {!Element} elem The element to add the event to.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
Dygraph.removeEvent = function(elem, type, fn) {
  if (elem.removeEventListener) {
    elem.removeEventListener(type, fn, false);
  } else {
    try {
      elem.detachEvent('on'+type, elem[type+fn]);
    } catch(e) {
      // We only detach event listeners on a "best effort" basis in IE. See:
      // http://stackoverflow.com/questions/2553632/detachevent-not-working-with-named-inline-functions
    }
    elem[type+fn] = null;
  }
};

Dygraph.prototype.removeTrackedEvents_ = function() {
  if (this.registeredEvents_) {
    for (var idx = 0; idx < this.registeredEvents_.length; idx++) {
      var reg = this.registeredEvents_[idx];
      Dygraph.removeEvent(reg.elem, reg.type, reg.fn);
    }
  }

  this.registeredEvents_ = [];
};

/**
 * Cancels further processing of an event. This is useful to prevent default
 * browser actions, e.g. highlighting text on a double-click.
 * Based on the article at
 * http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 * @param { !Event } e The event whose normal behavior should be canceled.
 * @private
 */
Dygraph.cancelEvent = function(e) {
  e = e ? e : window.event;
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.cancelBubble = true;
  e.cancel = true;
  e.returnValue = false;
  return false;
};

/**
 * Convert hsv values to an rgb(r,g,b) string. Taken from MochiKit.Color. This
 * is used to generate default series colors which are evenly spaced on the
 * color wheel.
 * @param { number } hue Range is 0.0-1.0.
 * @param { number } saturation Range is 0.0-1.0.
 * @param { number } value Range is 0.0-1.0.
 * @return { string } "rgb(r,g,b)" where r, g and b range from 0-255.
 * @private
 */
Dygraph.hsvToRGB = function (hue, saturation, value) {
  var red;
  var green;
  var blue;
  if (saturation === 0) {
    red = value;
    green = value;
    blue = value;
  } else {
    var i = Math.floor(hue * 6);
    var f = (hue * 6) - i;
    var p = value * (1 - saturation);
    var q = value * (1 - (saturation * f));
    var t = value * (1 - (saturation * (1 - f)));
    switch (i) {
      case 1: red = q; green = value; blue = p; break;
      case 2: red = p; green = value; blue = t; break;
      case 3: red = p; green = q; blue = value; break;
      case 4: red = t; green = p; blue = value; break;
      case 5: red = value; green = p; blue = q; break;
      case 6: // fall through
      case 0: red = value; green = t; blue = p; break;
    }
  }
  red = Math.floor(255 * red + 0.5);
  green = Math.floor(255 * green + 0.5);
  blue = Math.floor(255 * blue + 0.5);
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
};

// The following functions are from quirksmode.org with a modification for Safari from
// http://blog.firetree.net/2005/07/04/javascript-find-position/
// http://www.quirksmode.org/js/findpos.html
// ... and modifications to support scrolling divs.

/**
 * Find the x-coordinate of the supplied object relative to the left side
 * of the page.
 * TODO(danvk): change obj type from Node -&gt; !Node
 * @param {Node} obj
 * @return {number}
 * @private
 */
Dygraph.findPosX = function(obj) {
  var curleft = 0;
  if(obj.offsetParent) {
    var copyObj = obj;
    while(1) {
      // NOTE: the if statement here is for IE8.
      var borderLeft = "0";
      if (window.getComputedStyle) {
        borderLeft = window.getComputedStyle(copyObj, null).borderLeft || "0";
      }
      curleft += parseInt(borderLeft, 10) ;
      curleft += copyObj.offsetLeft;
      if(!copyObj.offsetParent) {
        break;
      }
      copyObj = copyObj.offsetParent;
    }
  } else if(obj.x) {
    curleft += obj.x;
  }
  // This handles the case where the object is inside a scrolled div.
  while(obj && obj != document.body) {
    curleft -= obj.scrollLeft;
    obj = obj.parentNode;
  }
  return curleft;
};

/**
 * Find the y-coordinate of the supplied object relative to the top of the
 * page.
 * TODO(danvk): change obj type from Node -&gt; !Node
 * TODO(danvk): consolidate with findPosX and return an {x, y} object.
 * @param {Node} obj
 * @return {number}
 * @private
 */
Dygraph.findPosY = function(obj) {
  var curtop = 0;
  if(obj.offsetParent) {
    var copyObj = obj;
    while(1) {
      // NOTE: the if statement here is for IE8.
      var borderTop = "0";
      if (window.getComputedStyle) {
        borderTop = window.getComputedStyle(copyObj, null).borderTop || "0";
      }
      curtop += parseInt(borderTop, 10) ;
      curtop += copyObj.offsetTop;
      if(!copyObj.offsetParent) {
        break;
      }
      copyObj = copyObj.offsetParent;
    }
  } else if(obj.y) {
    curtop += obj.y;
  }
  // This handles the case where the object is inside a scrolled div.
  while(obj && obj != document.body) {
    curtop -= obj.scrollTop;
    obj = obj.parentNode;
  }
  return curtop;
};

/**
 * Returns the x-coordinate of the event in a coordinate system where the
 * top-left corner of the page (not the window) is (0,0).
 * Taken from MochiKit.Signal
 * @param {!Event} e
 * @return {number}
 * @private
 */
Dygraph.pageX = function(e) {
  if (e.pageX) {
    return (!e.pageX || e.pageX < 0) ? 0 : e.pageX;
  } else {
    var de = document.documentElement;
    var b = document.body;
    return e.clientX +
        (de.scrollLeft || b.scrollLeft) -
        (de.clientLeft || 0);
  }
};

/**
 * Returns the y-coordinate of the event in a coordinate system where the
 * top-left corner of the page (not the window) is (0,0).
 * Taken from MochiKit.Signal
 * @param {!Event} e
 * @return {number}
 * @private
 */
Dygraph.pageY = function(e) {
  if (e.pageY) {
    return (!e.pageY || e.pageY < 0) ? 0 : e.pageY;
  } else {
    var de = document.documentElement;
    var b = document.body;
    return e.clientY +
        (de.scrollTop || b.scrollTop) -
        (de.clientTop || 0);
  }
};

/**
 * This returns true unless the parameter is 0, null, undefined or NaN.
 * TODO(danvk): rename this function to something like 'isNonZeroNan'.
 *
 * @param {number} x The number to consider.
 * @return {boolean} Whether the number is zero or NaN.
 * @private
 */
Dygraph.isOK = function(x) {
  return !!x && !isNaN(x);
};

/**
 * @param { {x:?number,y:?number,yval:?number} } p The point to consider, valid
 *     points are {x, y} objects
 * @param { boolean } allowNaNY Treat point with y=NaN as valid
 * @return { boolean } Whether the point has numeric x and y.
 * @private
 */
Dygraph.isValidPoint = function(p, allowNaNY) {
  if (!p) return false;  // null or undefined object
  if (p.yval === null) return false;  // missing point
  if (p.x === null || p.x === undefined) return false;
  if (p.y === null || p.y === undefined) return false;
  if (isNaN(p.x) || (!allowNaNY && isNaN(p.y))) return false;
  return true;
};

/**
 * Number formatting function which mimicks the behavior of %g in printf, i.e.
 * either exponential or fixed format (without trailing 0s) is used depending on
 * the length of the generated string.  The advantage of this format is that
 * there is a predictable upper bound on the resulting string length,
 * significant figures are not dropped, and normal numbers are not displayed in
 * exponential notation.
 *
 * NOTE: JavaScript's native toPrecision() is NOT a drop-in replacement for %g.
 * It creates strings which are too long for absolute values between 10^-4 and
 * 10^-6, e.g. '0.00001' instead of '1e-5'. See tests/number-format.html for
 * output examples.
 *
 * @param {number} x The number to format
 * @param {number=} opt_precision The precision to use, default 2.
 * @return {string} A string formatted like %g in printf.  The max generated
 *                  string length should be precision + 6 (e.g 1.123e+300).
 */
Dygraph.floatFormat = function(x, opt_precision) {
  // Avoid invalid precision values; [1, 21] is the valid range.
  var p = Math.min(Math.max(1, opt_precision || 2), 21);

  // This is deceptively simple.  The actual algorithm comes from:
  //
  // Max allowed length = p + 4
  // where 4 comes from 'e+n' and '.'.
  //
  // Length of fixed format = 2 + y + p
  // where 2 comes from '0.' and y = # of leading zeroes.
  //
  // Equating the two and solving for y yields y = 2, or 0.00xxxx which is
  // 1.0e-3.
  //
  // Since the behavior of toPrecision() is identical for larger numbers, we
  // don't have to worry about the other bound.
  //
  // Finally, the argument for toExponential() is the number of trailing digits,
  // so we take off 1 for the value before the '.'.
  return (Math.abs(x) < 1.0e-3 && x !== 0.0) ?
      x.toExponential(p - 1) : x.toPrecision(p);
};

/**
 * Converts '9' to '09' (useful for dates)
 * @param {number} x
 * @return {string}
 * @private
 */
Dygraph.zeropad = function(x) {
  if (x < 10) return "0" + x; else return "" + x;
};

/**
 * Return a string version of the hours, minutes and seconds portion of a date.
 *
 * @param {number} date The JavaScript date (ms since epoch)
 * @return {string} A time of the form "HH:MM:SS"
 * @private
 */
Dygraph.hmsString_ = function(date) {
  var zeropad = Dygraph.zeropad;
  var d = new Date(date);
  if (d.getSeconds()) {
    return zeropad(d.getHours()) + ":" +
           zeropad(d.getMinutes()) + ":" +
           zeropad(d.getSeconds());
  } else {
    return zeropad(d.getHours()) + ":" + zeropad(d.getMinutes());
  }
};

/**
 * Round a number to the specified number of digits past the decimal point.
 * @param {number} num The number to round
 * @param {number} places The number of decimals to which to round
 * @return {number} The rounded number
 * @private
 */
Dygraph.round_ = function(num, places) {
  var shift = Math.pow(10, places);
  return Math.round(num * shift)/shift;
};

/**
 * Implementation of binary search over an array.
 * Currently does not work when val is outside the range of arry's values.
 * @param {number} val the value to search for
 * @param {Array.<number>} arry is the value over which to search
 * @param {number} abs If abs > 0, find the lowest entry greater than val
 *     If abs < 0, find the highest entry less than val.
 *     If abs == 0, find the entry that equals val.
 * @param {number=} low The first index in arry to consider (optional)
 * @param {number=} high The last index in arry to consider (optional)
 * @return {number} Index of the element, or -1 if it isn't found.
 * @private
 */
Dygraph.binarySearch = function(val, arry, abs, low, high) {
  if (low === null || low === undefined ||
      high === null || high === undefined) {
    low = 0;
    high = arry.length - 1;
  }
  if (low > high) {
    return -1;
  }
  if (abs === null || abs === undefined) {
    abs = 0;
  }
  var validIndex = function(idx) {
    return idx >= 0 && idx < arry.length;
  };
  var mid = parseInt((low + high) / 2, 10);
  var element = arry[mid];
  var idx;
  if (element == val) {
    return mid;
  } else if (element > val) {
    if (abs > 0) {
      // Accept if element > val, but also if prior element < val.
      idx = mid - 1;
      if (validIndex(idx) && arry[idx] < val) {
        return mid;
      }
    }
    return Dygraph.binarySearch(val, arry, abs, low, mid - 1);
  } else if (element < val) {
    if (abs < 0) {
      // Accept if element < val, but also if prior element > val.
      idx = mid + 1;
      if (validIndex(idx) && arry[idx] > val) {
        return mid;
      }
    }
    return Dygraph.binarySearch(val, arry, abs, mid + 1, high);
  }
  return -1;  // can't actually happen, but makes closure compiler happy
};

/**
 * Parses a date, returning the number of milliseconds since epoch. This can be
 * passed in as an xValueParser in the Dygraph constructor.
 * TODO(danvk): enumerate formats that this understands.
 *
 * @param {string} dateStr A date in a variety of possible string formats.
 * @return {number} Milliseconds since epoch.
 * @private
 */
Dygraph.dateParser = function(dateStr) {
  var dateStrSlashed;
  var d;

  // Let the system try the format first, with one caveat:
  // YYYY-MM-DD[ HH:MM:SS] is interpreted as UTC by a variety of browsers.
  // dygraphs displays dates in local time, so this will result in surprising
  // inconsistencies. But if you specify "T" or "Z" (i.e. YYYY-MM-DDTHH:MM:SS),
  // then you probably know what you're doing, so we'll let you go ahead.
  // Issue: http://code.google.com/p/dygraphs/issues/detail?id=255
  if (dateStr.search("-") == -1 ||
      dateStr.search("T") != -1 || dateStr.search("Z") != -1) {
    d = Dygraph.dateStrToMillis(dateStr);
    if (d && !isNaN(d)) return d;
  }

  if (dateStr.search("-") != -1) {  // e.g. '2009-7-12' or '2009-07-12'
    dateStrSlashed = dateStr.replace("-", "/", "g");
    while (dateStrSlashed.search("-") != -1) {
      dateStrSlashed = dateStrSlashed.replace("-", "/");
    }
    d = Dygraph.dateStrToMillis(dateStrSlashed);
  } else if (dateStr.length == 8) {  // e.g. '20090712'
    // TODO(danvk): remove support for this format. It's confusing.
    dateStrSlashed = dateStr.substr(0,4) + "/" + dateStr.substr(4,2) + "/" +
        dateStr.substr(6,2);
    d = Dygraph.dateStrToMillis(dateStrSlashed);
  } else {
    // Any format that Date.parse will accept, e.g. "2009/07/12" or
    // "2009/07/12 12:34:56"
    d = Dygraph.dateStrToMillis(dateStr);
  }

  if (!d || isNaN(d)) {
    Dygraph.error("Couldn't parse " + dateStr + " as a date");
  }
  return d;
};

/**
 * This is identical to JavaScript's built-in Date.parse() method, except that
 * it doesn't get replaced with an incompatible method by aggressive JS
 * libraries like MooTools or Joomla.
 * @param {string} str The date string, e.g. "2011/05/06"
 * @return {number} millis since epoch
 * @private
 */
Dygraph.dateStrToMillis = function(str) {
  return new Date(str).getTime();
};

// These functions are all based on MochiKit.
/**
 * Copies all the properties from o to self.
 *
 * @param {!Object} self
 * @param {!Object} o
 * @return {!Object}
 */
Dygraph.update = function(self, o) {
  if (typeof(o) != 'undefined' && o !== null) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        self[k] = o[k];
      }
    }
  }
  return self;
};

/**
 * Copies all the properties from o to self.
 *
 * @param {!Object} self
 * @param {!Object} o
 * @return {!Object}
 * @private
 */
Dygraph.updateDeep = function (self, o) {
  // Taken from http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  function isNode(o) {
    return (
      typeof Node === "object" ? o instanceof Node :
      typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
  }

  if (typeof(o) != 'undefined' && o !== null) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        if (o[k] === null) {
          self[k] = null;
        } else if (Dygraph.isArrayLike(o[k])) {
          self[k] = o[k].slice();
        } else if (isNode(o[k])) {
          // DOM objects are shallowly-copied.
          self[k] = o[k];
        } else if (typeof(o[k]) == 'object') {
          if (typeof(self[k]) != 'object' || self[k] === null) {
            self[k] = {};
          }
          Dygraph.updateDeep(self[k], o[k]);
        } else {
          self[k] = o[k];
        }
      }
    }
  }
  return self;
};

/**
 * @param {Object} o
 * @return {boolean}
 * @private
 */
Dygraph.isArrayLike = function(o) {
  var typ = typeof(o);
  if (
      (typ != 'object' && !(typ == 'function' &&
        typeof(o.item) == 'function')) ||
      o === null ||
      typeof(o.length) != 'number' ||
      o.nodeType === 3
     ) {
    return false;
  }
  return true;
};

/**
 * @param {Object} o
 * @return {boolean}
 * @private
 */
Dygraph.isDateLike = function (o) {
  if (typeof(o) != "object" || o === null ||
      typeof(o.getTime) != 'function') {
    return false;
  }
  return true;
};

/**
 * Note: this only seems to work for arrays.
 * @param {!Array} o
 * @return {!Array}
 * @private
 */
Dygraph.clone = function(o) {
  // TODO(danvk): figure out how MochiKit's version works
  var r = [];
  for (var i = 0; i < o.length; i++) {
    if (Dygraph.isArrayLike(o[i])) {
      r.push(Dygraph.clone(o[i]));
    } else {
      r.push(o[i]);
    }
  }
  return r;
};

/**
 * Create a new canvas element. This is more complex than a simple
 * document.createElement("canvas") because of IE and excanvas.
 *
 * @return {!HTMLCanvasElement}
 * @private
 */
Dygraph.createCanvas = function() {
  var canvas = document.createElement("canvas");

  var isIE = (/MSIE/.test(navigator.userAgent) && !window.opera);
  if (isIE && (typeof(G_vmlCanvasManager) != 'undefined')) {
    canvas = G_vmlCanvasManager.initElement(
        /**@type{!HTMLCanvasElement}*/(canvas));
  }

  return canvas;
};

/**
 * Checks whether the user is on an Android browser.
 * Android does not fully support the <canvas> tag, e.g. w/r/t/ clipping.
 * @return {boolean}
 * @private
 */
Dygraph.isAndroid = function() {
  return (/Android/).test(navigator.userAgent);
};


/**
 * TODO(danvk): use @template here when it's better supported for classes.
 * @param {!Array} array
 * @param {number} start
 * @param {number} length
 * @param {function(!Array,?):boolean=} predicate
 * @constructor
 */
Dygraph.Iterator = function(array, start, length, predicate) {
  start = start || 0;
  length = length || array.length;
  this.hasNext = true; // Use to identify if there's another element.
  this.peek = null; // Use for look-ahead
  this.start_ = start;
  this.array_ = array;
  this.predicate_ = predicate;
  this.end_ = Math.min(array.length, start + length);
  this.nextIdx_ = start - 1; // use -1 so initial advance works.
  this.next(); // ignoring result.
};

/**
 * @return {Object}
 */
Dygraph.Iterator.prototype.next = function() {
  if (!this.hasNext) {
    return null;
  }
  var obj = this.peek;

  var nextIdx = this.nextIdx_ + 1;
  var found = false;
  while (nextIdx < this.end_) {
    if (!this.predicate_ || this.predicate_(this.array_, nextIdx)) {
      this.peek = this.array_[nextIdx];
      found = true;
      break;
    }
    nextIdx++;
  }
  this.nextIdx_ = nextIdx;
  if (!found) {
    this.hasNext = false;
    this.peek = null;
  }
  return obj;
};

/**
 * Returns a new iterator over array, between indexes start and
 * start + length, and only returns entries that pass the accept function
 *
 * @param {!Array} array the array to iterate over.
 * @param {number} start the first index to iterate over, 0 if absent.
 * @param {number} length the number of elements in the array to iterate over.
 *     This, along with start, defines a slice of the array, and so length
 *     doesn't imply the number of elements in the iterator when accept doesn't
 *     always accept all values. array.length when absent.
 * @param {function(?):boolean=} opt_predicate a function that takes
 *     parameters array and idx, which returns true when the element should be
 *     returned.  If omitted, all elements are accepted.
 * @private
 */
Dygraph.createIterator = function(array, start, length, opt_predicate) {
  return new Dygraph.Iterator(array, start, length, opt_predicate);
};

// Shim layer with setTimeout fallback.
// From: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// Should be called with the window context:
//   Dygraph.requestAnimFrame.call(window, function() {})
Dygraph.requestAnimFrame = (function() {
  return window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * Call a function at most maxFrames times at an attempted interval of
 * framePeriodInMillis, then call a cleanup function once. repeatFn is called
 * once immediately, then at most (maxFrames - 1) times asynchronously. If
 * maxFrames==1, then cleanup_fn() is also called synchronously.  This function
 * is used to sequence animation.
 * @param {function(number)} repeatFn Called repeatedly -- takes the frame
 *     number (from 0 to maxFrames-1) as an argument.
 * @param {number} maxFrames The max number of times to call repeatFn
 * @param {number} framePeriodInMillis Max requested time between frames.
 * @param {function()} cleanupFn A function to call after all repeatFn calls.
 * @private
 */
Dygraph.repeatAndCleanup = function(repeatFn, maxFrames, framePeriodInMillis,
    cleanupFn) {
  var frameNumber = 0;
  var previousFrameNumber;
  var startTime = new Date().getTime();
  repeatFn(frameNumber);
  if (maxFrames == 1) {
    cleanupFn();
    return;
  }
  var maxFrameArg = maxFrames - 1;

  (function loop() {
    if (frameNumber >= maxFrames) return;
    Dygraph.requestAnimFrame.call(window, function() {
      // Determine which frame to draw based on the delay so far.  Will skip
      // frames if necessary.
      var currentTime = new Date().getTime();
      var delayInMillis = currentTime - startTime;
      previousFrameNumber = frameNumber;
      frameNumber = Math.floor(delayInMillis / framePeriodInMillis);
      var frameDelta = frameNumber - previousFrameNumber;
      // If we predict that the subsequent repeatFn call will overshoot our
      // total frame target, so our last call will cause a stutter, then jump to
      // the last call immediately.  If we're going to cause a stutter, better
      // to do it faster than slower.
      var predictOvershootStutter = (frameNumber + frameDelta) > maxFrameArg;
      if (predictOvershootStutter || (frameNumber >= maxFrameArg)) {
        repeatFn(maxFrameArg);  // Ensure final call with maxFrameArg.
        cleanupFn();
      } else {
        if (frameDelta !== 0) {  // Don't call repeatFn with duplicate frames.
          repeatFn(frameNumber);
        }
        loop();
      }
    });
  })();
};

/**
 * This function will scan the option list and determine if they
 * require us to recalculate the pixel positions of each point.
 * @param {!Array.<string>} labels a list of options to check.
 * @param {!Object} attrs
 * @return {boolean} true if the graph needs new points else false.
 * @private
 */
Dygraph.isPixelChangingOptionList = function(labels, attrs) {
  // A whitelist of options that do not change pixel positions.
  var pixelSafeOptions = {
    'annotationClickHandler': true,
    'annotationDblClickHandler': true,
    'annotationMouseOutHandler': true,
    'annotationMouseOverHandler': true,
    'axisLabelColor': true,
    'axisLineColor': true,
    'axisLineWidth': true,
    'clickCallback': true,
    'digitsAfterDecimal': true,
    'drawCallback': true,
    'drawHighlightPointCallback': true,
    'drawPoints': true,
    'drawPointCallback': true,
    'drawXGrid': true,
    'drawYGrid': true,
    'fillAlpha': true,
    'gridLineColor': true,
    'gridLineWidth': true,
    'hideOverlayOnMouseOut': true,
    'highlightCallback': true,
    'highlightCircleSize': true,
    'interactionModel': true,
    'isZoomedIgnoreProgrammaticZoom': true,
    'labelsDiv': true,
    'labelsDivStyles': true,
    'labelsDivWidth': true,
    'labelsKMB': true,
    'labelsKMG2': true,
    'labelsSeparateLines': true,
    'labelsShowZeroValues': true,
    'legend': true,
    'maxNumberWidth': true,
    'panEdgeFraction': true,
    'pixelsPerYLabel': true,
    'pointClickCallback': true,
    'pointSize': true,
    'rangeSelectorPlotFillColor': true,
    'rangeSelectorPlotStrokeColor': true,
    'showLabelsOnHighlight': true,
    'showRoller': true,
    'sigFigs': true,
    'strokeWidth': true,
    'underlayCallback': true,
    'unhighlightCallback': true,
    'xAxisLabelFormatter': true,
    'xTicker': true,
    'xValueFormatter': true,
    'yAxisLabelFormatter': true,
    'yValueFormatter': true,
    'zoomCallback': true
  };

  // Assume that we do not require new points.
  // This will change to true if we actually do need new points.
  var requiresNewPoints = false;

  // Create a dictionary of series names for faster lookup.
  // If there are no labels, then the dictionary stays empty.
  var seriesNamesDictionary = { };
  if (labels) {
    for (var i = 1; i < labels.length; i++) {
      seriesNamesDictionary[labels[i]] = true;
    }
  }

  // Iterate through the list of updated options.
  for (var property in attrs) {
    // Break early if we already know we need new points from a previous option.
    if (requiresNewPoints) {
      break;
    }
    if (attrs.hasOwnProperty(property)) {
      // Find out of this field is actually a series specific options list.
      if (seriesNamesDictionary[property]) {
        // This property value is a list of options for this series.
        // If any of these sub properties are not pixel safe, set the flag.
        for (var subProperty in attrs[property]) {
          // Break early if we already know we need new points from a previous option.
          if (requiresNewPoints) {
            break;
          }
          if (attrs[property].hasOwnProperty(subProperty) && !pixelSafeOptions[subProperty]) {
            requiresNewPoints = true;
          }
        }
      // If this was not a series specific option list, check if its a pixel changing property.
      } else if (!pixelSafeOptions[property]) {
        requiresNewPoints = true;
      }
    }
  }

  return requiresNewPoints;
};

/**
 * Compares two arrays to see if they are equal. If either parameter is not an
 * array it will return false. Does a shallow compare
 * Dygraph.compareArrays([[1,2], [3, 4]], [[1,2], [3,4]]) === false.
 * @param {!Array.<T>} array1 first array
 * @param {!Array.<T>} array2 second array
 * @return {boolean} True if both parameters are arrays, and contents are equal.
 * @template T
 */
Dygraph.compareArrays = function(array1, array2) {
  if (!Dygraph.isArrayLike(array1) || !Dygraph.isArrayLike(array2)) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (var i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
};

/**
 * @param {!CanvasRenderingContext2D} ctx the canvas context
 * @param {number} sides the number of sides in the shape.
 * @param {number} radius the radius of the image.
 * @param {number} cx center x coordate
 * @param {number} cy center y coordinate
 * @param {number=} rotationRadians the shift of the initial angle, in radians.
 * @param {number=} delta the angle shift for each line. If missing, creates a
 *     regular polygon.
 * @private
 */
Dygraph.regularShape_ = function(
    ctx, sides, radius, cx, cy, rotationRadians, delta) {
  rotationRadians = rotationRadians || 0;
  delta = delta || Math.PI * 2 / sides;

  ctx.beginPath();
  var initialAngle = rotationRadians;
  var angle = initialAngle;

  var computeCoordinates = function() {
    var x = cx + (Math.sin(angle) * radius);
    var y = cy + (-Math.cos(angle) * radius);
    return [x, y];
  };

  var initialCoordinates = computeCoordinates();
  var x = initialCoordinates[0];
  var y = initialCoordinates[1];
  ctx.moveTo(x, y);

  for (var idx = 0; idx < sides; idx++) {
    angle = (idx == sides - 1) ? initialAngle : (angle + delta);
    var coords = computeCoordinates();
    ctx.lineTo(coords[0], coords[1]);
  }
  ctx.fill();
  ctx.stroke();
};

/**
 * TODO(danvk): be more specific on the return type.
 * @param {number} sides
 * @param {number=} rotationRadians
 * @param {number=} delta
 * @return {Function}
 * @private
 */
Dygraph.shapeFunction_ = function(sides, rotationRadians, delta) {
  return function(g, name, ctx, cx, cy, color, radius) {
    ctx.strokeStyle = color;
    ctx.fillStyle = "white";
    Dygraph.regularShape_(ctx, sides, radius, cx, cy, rotationRadians, delta);
  };
};

Dygraph.Circles = {
  DEFAULT : function(g, name, ctx, canvasx, canvasy, color, radius) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(canvasx, canvasy, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  },
  TRIANGLE : Dygraph.shapeFunction_(3),
  SQUARE : Dygraph.shapeFunction_(4, Math.PI / 4),
  DIAMOND : Dygraph.shapeFunction_(4),
  PENTAGON : Dygraph.shapeFunction_(5),
  HEXAGON : Dygraph.shapeFunction_(6),
  CIRCLE : function(g, name, ctx, cx, cy, color, radius) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = "white";
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
  },
  STAR : Dygraph.shapeFunction_(5, 0, 4 * Math.PI / 5),
  PLUS : function(g, name, ctx, cx, cy, color, radius) {
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(cx + radius, cy);
    ctx.lineTo(cx - radius, cy);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy + radius);
    ctx.lineTo(cx, cy - radius);
    ctx.closePath();
    ctx.stroke();
  },
  EX : function(g, name, ctx, cx, cy, color, radius) {
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(cx + radius, cy + radius);
    ctx.lineTo(cx - radius, cy - radius);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + radius, cy - radius);
    ctx.lineTo(cx - radius, cy + radius);
    ctx.closePath();
    ctx.stroke();
  }
};

/**
 * To create a "drag" interaction, you typically register a mousedown event
 * handler on the element where the drag begins. In that handler, you register a
 * mouseup handler on the window to determine when the mouse is released,
 * wherever that release happens. This works well, except when the user releases
 * the mouse over an off-domain iframe. In that case, the mouseup event is
 * handled by the iframe and never bubbles up to the window handler.
 *
 * To deal with this issue, we cover iframes with high z-index divs to make sure
 * they don't capture mouseup.
 *
 * Usage:
 * element.addEventListener('mousedown', function() {
 *   var tarper = new Dygraph.IFrameTarp();
 *   tarper.cover();
 *   var mouseUpHandler = function() {
 *     ...
 *     window.removeEventListener(mouseUpHandler);
 *     tarper.uncover();
 *   };
 *   window.addEventListener('mouseup', mouseUpHandler);
 * };
 *
 * @constructor
 */
Dygraph.IFrameTarp = function() {
  /** @type {Array.<!HTMLDivElement>} */
  this.tarps = [];
};

/**
 * Find all the iframes in the document and cover them with high z-index
 * transparent divs.
 */
Dygraph.IFrameTarp.prototype.cover = function() {
  var iframes = document.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var x = Dygraph.findPosX(iframe),
        y = Dygraph.findPosY(iframe),
        width = iframe.offsetWidth,
        height = iframe.offsetHeight;

    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.zIndex = 999;
    document.body.appendChild(div);
    this.tarps.push(div);
  }
};

/**
 * Remove all the iframe covers. You should call this in a mouseup handler.
 */
Dygraph.IFrameTarp.prototype.uncover = function() {
  for (var i = 0; i < this.tarps.length; i++) {
    this.tarps[i].parentNode.removeChild(this.tarps[i]);
  }
  this.tarps = [];
};

/**
 * Determine whether |data| is delimited by CR, CRLF, LF, LFCR.
 * @param {string} data
 * @return {?string} the delimiter that was detected (or null on failure).
 */
Dygraph.detectLineDelimiter = function(data) {
  for (var i = 0; i < data.length; i++) {
    var code = data.charAt(i);
    if (code === '\r') {
      // Might actually be "\r\n".
      if (((i + 1) < data.length) && (data.charAt(i + 1) === '\n')) {
        return '\r\n';
      }
      return code;
    }
    if (code === '\n') {
      // Might actually be "\n\r".
      if (((i + 1) < data.length) && (data.charAt(i + 1) === '\r')) {
        return '\n\r';
      }
      return code;
    }
  }

  return null;
};

/**
 * Is one node contained by another?
 * @param {Node} containee The contained node.
 * @param {Node} container The container node.
 * @return {boolean} Whether containee is inside (or equal to) container.
 * @private
 */
Dygraph.isNodeContainedBy = function(containee, container) {
  if (container === null || containee === null) {
    return false;
  }
  var containeeNode = /** @type {Node} */ (containee);
  while (containeeNode && containeeNode !== container) {
    containeeNode = containeeNode.parentNode;
  }
  return (containeeNode === container);
};


// This masks some numeric issues in older versions of Firefox,
// where 1.0/Math.pow(10,2) != Math.pow(10,-2).
/** @type {function(number,number):number} */
Dygraph.pow = function(base, exp) {
  if (exp < 0) {
    return 1.0 / Math.pow(base, -exp);
  }
  return Math.pow(base, exp);
};

// For Dygraph.setDateSameTZ, below.
Dygraph.dateSetters = {
  ms: Date.prototype.setMilliseconds,
  s: Date.prototype.setSeconds,
  m: Date.prototype.setMinutes,
  h: Date.prototype.setHours
};

/**
 * This is like calling d.setSeconds(), d.setMinutes(), etc, except that it
 * adjusts for time zone changes to keep the date/time parts consistent.
 *
 * For example, d.getSeconds(), d.getMinutes() and d.getHours() will all be
 * the same before/after you call setDateSameTZ(d, {ms: 0}). The same is not
 * true if you call d.setMilliseconds(0).
 *
 * @type {function(!Date, Object.<number>)}
 */
Dygraph.setDateSameTZ = function(d, parts) {
  var tz = d.getTimezoneOffset();
  for (var k in parts) {
    if (!parts.hasOwnProperty(k)) continue;
    var setter = Dygraph.dateSetters[k];
    if (!setter) throw "Invalid setter: " + k;
    setter.call(d, parts[k]);
    if (d.getTimezoneOffset() != tz) {
      d.setTime(d.getTime() + (tz - d.getTimezoneOffset()) * 60 * 1000);
    }
  }
};

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview A wrapper around the Dygraph class which implements the
 * interface for a GViz (aka Google Visualization API) visualization.
 * It is designed to be a drop-in replacement for Google's AnnotatedTimeline,
 * so the documentation at
 * http://code.google.com/apis/chart/interactive/docs/gallery/annotatedtimeline.html
 * translates over directly.
 *
 * For a full demo, see:
 * - http://dygraphs.com/tests/gviz.html
 * - http://dygraphs.com/tests/annotation-gviz.html
 */

/*jshint globalstrict: true */
/*global Dygraph:false */
"use strict";

/**
 * A wrapper around Dygraph that implements the gviz API.
 * @param {!HTMLDivElement} container The DOM object the visualization should
 *     live in.
 * @constructor
 */
Dygraph.GVizChart = function(container) {
  this.container = container;
};

/**
 * @param {GVizDataTable} data
 * @param {Object.<*>} options
 */
Dygraph.GVizChart.prototype.draw = function(data, options) {
  // Clear out any existing dygraph.
  // TODO(danvk): would it make more sense to simply redraw using the current
  // date_graph object?
  this.container.innerHTML = '';
  if (typeof(this.date_graph) != 'undefined') {
    this.date_graph.destroy();
  }

  this.date_graph = new Dygraph(this.container, data, options);
};

/**
 * Google charts compatible setSelection
 * Only row selection is supported, all points in the row will be highlighted
 * @param {Array.<{row:number}>} selection_array array of the selected cells
 * @public
 */
Dygraph.GVizChart.prototype.setSelection = function(selection_array) {
  var row = false;
  if (selection_array.length) {
    row = selection_array[0].row;
  }
  this.date_graph.setSelection(row);
};

/**
 * Google charts compatible getSelection implementation
 * @return {Array.<{row:number,column:number}>} array of the selected cells
 * @public
 */
Dygraph.GVizChart.prototype.getSelection = function() {
  var selection = [];

  var row = this.date_graph.getSelection();

  if (row < 0) return selection;

  var points = this.date_graph.layout_.points;
  for (var setIdx = 0; setIdx < points.length; ++setIdx) {
    selection.push({row: row, column: setIdx + 1});
  }

  return selection;
};

/**
 * @license
 * Copyright 2011 Robert Konigsberg (konigsberg@google.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview The default interaction model for Dygraphs. This is kept out
 * of dygraph.js for better navigability.
 * @author Robert Konigsberg (konigsberg@google.com)
 */

/*jshint globalstrict: true */
/*global Dygraph:false */
"use strict";

/**
 * A collection of functions to facilitate build custom interaction models.
 * @class
 */
Dygraph.Interaction = {};

/**
 * Called in response to an interaction model operation that
 * should start the default panning behavior.
 *
 * It's used in the default callback for "mousedown" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the startPan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
Dygraph.Interaction.startPan = function(event, g, context) {
  var i, axis;
  context.isPanning = true;
  var xRange = g.xAxisRange();
  context.dateRange = xRange[1] - xRange[0];
  context.initialLeftmostDate = xRange[0];
  context.xUnitsPerPixel = context.dateRange / (g.plotter_.area.w - 1);

  if (g.attr_("panEdgeFraction")) {
    var maxXPixelsToDraw = g.width_ * g.attr_("panEdgeFraction");
    var xExtremes = g.xAxisExtremes(); // I REALLY WANT TO CALL THIS xTremes!

    var boundedLeftX = g.toDomXCoord(xExtremes[0]) - maxXPixelsToDraw;
    var boundedRightX = g.toDomXCoord(xExtremes[1]) + maxXPixelsToDraw;

    var boundedLeftDate = g.toDataXCoord(boundedLeftX);
    var boundedRightDate = g.toDataXCoord(boundedRightX);
    context.boundedDates = [boundedLeftDate, boundedRightDate];

    var boundedValues = [];
    var maxYPixelsToDraw = g.height_ * g.attr_("panEdgeFraction");

    for (i = 0; i < g.axes_.length; i++) {
      axis = g.axes_[i];
      var yExtremes = axis.extremeRange;

      var boundedTopY = g.toDomYCoord(yExtremes[0], i) + maxYPixelsToDraw;
      var boundedBottomY = g.toDomYCoord(yExtremes[1], i) - maxYPixelsToDraw;

      var boundedTopValue = g.toDataYCoord(boundedTopY, i);
      var boundedBottomValue = g.toDataYCoord(boundedBottomY, i);

      boundedValues[i] = [boundedTopValue, boundedBottomValue];
    }
    context.boundedValues = boundedValues;
  }

  // Record the range of each y-axis at the start of the drag.
  // If any axis has a valueRange or valueWindow, then we want a 2D pan.
  // We can't store data directly in g.axes_, because it does not belong to us
  // and could change out from under us during a pan (say if there's a data
  // update).
  context.is2DPan = false;
  context.axes = [];
  for (i = 0; i < g.axes_.length; i++) {
    axis = g.axes_[i];
    var axis_data = {};
    var yRange = g.yAxisRange(i);
    // TODO(konigsberg): These values should be in |context|.
    // In log scale, initialTopValue, dragValueRange and unitsPerPixel are log scale.
    var logscale = g.attributes_.getForAxis("logscale", i);
    if (logscale) {
      axis_data.initialTopValue = Dygraph.log10(yRange[1]);
      axis_data.dragValueRange = Dygraph.log10(yRange[1]) - Dygraph.log10(yRange[0]);
    } else {
      axis_data.initialTopValue = yRange[1];
      axis_data.dragValueRange = yRange[1] - yRange[0];
    }
    axis_data.unitsPerPixel = axis_data.dragValueRange / (g.plotter_.area.h - 1);
    context.axes.push(axis_data);

    // While calculating axes, set 2dpan.
    if (axis.valueWindow || axis.valueRange) context.is2DPan = true;
  }
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that pans the view.
 *
 * It's used in the default callback for "mousemove" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the movePan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
Dygraph.Interaction.movePan = function(event, g, context) {
  context.dragEndX = g.dragGetX_(event, context);
  context.dragEndY = g.dragGetY_(event, context);

  var minDate = context.initialLeftmostDate -
    (context.dragEndX - context.dragStartX) * context.xUnitsPerPixel;
  if (context.boundedDates) {
    minDate = Math.max(minDate, context.boundedDates[0]);
  }
  var maxDate = minDate + context.dateRange;
  if (context.boundedDates) {
    if (maxDate > context.boundedDates[1]) {
      // Adjust minDate, and recompute maxDate.
      minDate = minDate - (maxDate - context.boundedDates[1]);
      maxDate = minDate + context.dateRange;
    }
  }

  g.dateWindow_ = [minDate, maxDate];

  // y-axis scaling is automatic unless this is a full 2D pan.
  if (context.is2DPan) {

    var pixelsDragged = context.dragEndY - context.dragStartY;

    // Adjust each axis appropriately.
    for (var i = 0; i < g.axes_.length; i++) {
      var axis = g.axes_[i];
      var axis_data = context.axes[i];
      var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;

      var boundedValue = context.boundedValues ? context.boundedValues[i] : null;

      // In log scale, maxValue and minValue are the logs of those values.
      var maxValue = axis_data.initialTopValue + unitsDragged;
      if (boundedValue) {
        maxValue = Math.min(maxValue, boundedValue[1]);
      }
      var minValue = maxValue - axis_data.dragValueRange;
      if (boundedValue) {
        if (minValue < boundedValue[0]) {
          // Adjust maxValue, and recompute minValue.
          maxValue = maxValue - (minValue - boundedValue[0]);
          minValue = maxValue - axis_data.dragValueRange;
        }
      }
      var logscale = g.attributes_.getForAxis("logscale", i);
      if (logscale) {
        axis.valueWindow = [ Math.pow(Dygraph.LOG_SCALE, minValue),
                             Math.pow(Dygraph.LOG_SCALE, maxValue) ];
      } else {
        axis.valueWindow = [ minValue, maxValue ];
      }
    }
  }

  g.drawGraph_(false);
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that ends panning.
 *
 * It's used in the default callback for "mouseup" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the endPan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
Dygraph.Interaction.endPan = function(event, g, context) {
  context.dragEndX = g.dragGetX_(event, context);
  context.dragEndY = g.dragGetY_(event, context);

  var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
  var regionHeight = Math.abs(context.dragEndY - context.dragStartY);

  if (regionWidth < 2 && regionHeight < 2 &&
      g.lastx_ !== undefined && g.lastx_ != -1) {
    Dygraph.Interaction.treatMouseOpAsClick(g, event, context);
  }

  // TODO(konigsberg): mouseup should just delete the
  // context object, and mousedown should create a new one.
  context.isPanning = false;
  context.is2DPan = false;
  context.initialLeftmostDate = null;
  context.dateRange = null;
  context.valueRange = null;
  context.boundedDates = null;
  context.boundedValues = null;
  context.axes = null;
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that starts zooming.
 *
 * It's used in the default callback for "mousedown" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the startZoom call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
Dygraph.Interaction.startZoom = function(event, g, context) {
  context.isZooming = true;
  context.zoomMoved = false;
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that defines zoom boundaries.
 *
 * It's used in the default callback for "mousemove" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the moveZoom call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
Dygraph.Interaction.moveZoom = function(event, g, context) {
  context.zoomMoved = true;
  context.dragEndX = g.dragGetX_(event, context);
  context.dragEndY = g.dragGetY_(event, context);

  var xDelta = Math.abs(context.dragStartX - context.dragEndX);
  var yDelta = Math.abs(context.dragStartY - context.dragEndY);

  // drag direction threshold for y axis is twice as large as x axis
  context.dragDirection = (xDelta < yDelta / 2) ? Dygraph.VERTICAL : Dygraph.HORIZONTAL;

  g.drawZoomRect_(
      context.dragDirection,
      context.dragStartX,
      context.dragEndX,
      context.dragStartY,
      context.dragEndY,
      context.prevDragDirection,
      context.prevEndX,
      context.prevEndY);

  context.prevEndX = context.dragEndX;
  context.prevEndY = context.dragEndY;
  context.prevDragDirection = context.dragDirection;
};

/**
 * @param {Dygraph} g
 * @param {Event} event
 * @param {Object} context
 */
Dygraph.Interaction.treatMouseOpAsClick = function(g, event, context) {
  var clickCallback = g.attr_('clickCallback');
  var pointClickCallback = g.attr_('pointClickCallback');

  var selectedPoint = null;

  // Find out if the click occurs on a point. This only matters if there's a
  // pointClickCallback.
  if (pointClickCallback) {
    var closestIdx = -1;
    var closestDistance = Number.MAX_VALUE;

    // check if the click was on a particular point.
    for (var i = 0; i < g.selPoints_.length; i++) {
      var p = g.selPoints_[i];
      var distance = Math.pow(p.canvasx - context.dragEndX, 2) +
                     Math.pow(p.canvasy - context.dragEndY, 2);
      if (!isNaN(distance) &&
          (closestIdx == -1 || distance < closestDistance)) {
        closestDistance = distance;
        closestIdx = i;
      }
    }

    // Allow any click within two pixels of the dot.
    var radius = g.attr_('highlightCircleSize') + 2;
    if (closestDistance <= radius * radius) {
      selectedPoint = g.selPoints_[closestIdx];
    }
  }

  if (selectedPoint) {
    pointClickCallback(event, selectedPoint);
  }

  // TODO(danvk): pass along more info about the points, e.g. 'x'
  if (clickCallback) {
    clickCallback(event, g.lastx_, g.selPoints_);
  }
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that performs a zoom based on previously defined
 * bounds..
 *
 * It's used in the default callback for "mouseup" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the endZoom call.
 * @param {Dygraph} g The dygraph on which to end the zoom.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
Dygraph.Interaction.endZoom = function(event, g, context) {
  context.isZooming = false;
  context.dragEndX = g.dragGetX_(event, context);
  context.dragEndY = g.dragGetY_(event, context);
  var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
  var regionHeight = Math.abs(context.dragEndY - context.dragStartY);

  if (regionWidth < 2 && regionHeight < 2 &&
      g.lastx_ !== undefined && g.lastx_ != -1) {
    Dygraph.Interaction.treatMouseOpAsClick(g, event, context);
  }

  // The zoom rectangle is visibly clipped to the plot area, so its behavior
  // should be as well.
  // See http://code.google.com/p/dygraphs/issues/detail?id=280
  var plotArea = g.getArea();
  if (regionWidth >= 10 && context.dragDirection == Dygraph.HORIZONTAL) {
    var left = Math.min(context.dragStartX, context.dragEndX),
        right = Math.max(context.dragStartX, context.dragEndX);
    left = Math.max(left, plotArea.x);
    right = Math.min(right, plotArea.x + plotArea.w);
    if (left < right) {
      g.doZoomX_(left, right);
    }
    context.cancelNextDblclick = true;
  } else if (regionHeight >= 10 && context.dragDirection == Dygraph.VERTICAL) {
    var top = Math.min(context.dragStartY, context.dragEndY),
        bottom = Math.max(context.dragStartY, context.dragEndY);
    top = Math.max(top, plotArea.y);
    bottom = Math.min(bottom, plotArea.y + plotArea.h);
    if (top < bottom) {
      g.doZoomY_(top, bottom);
    }
    context.cancelNextDblclick = true;
  } else {
    if (context.zoomMoved) g.clearZoomRect_();
  }
  context.dragStartX = null;
  context.dragStartY = null;
};

/**
 * @private
 */
Dygraph.Interaction.startTouch = function(event, g, context) {
  event.preventDefault();  // touch browsers are all nice.
  if (event.touches.length > 1) {
    // If the user ever puts two fingers down, it's not a double tap.
    context.startTimeForDoubleTapMs = null;
  }

  var touches = [];
  for (var i = 0; i < event.touches.length; i++) {
    var t = event.touches[i];
    // we dispense with 'dragGetX_' because all touchBrowsers support pageX
    touches.push({
      pageX: t.pageX,
      pageY: t.pageY,
      dataX: g.toDataXCoord(t.pageX),
      dataY: g.toDataYCoord(t.pageY)
      // identifier: t.identifier
    });
  }
  context.initialTouches = touches;

  if (touches.length == 1) {
    // This is just a swipe.
    context.initialPinchCenter = touches[0];
    context.touchDirections = { x: true, y: true };
  } else if (touches.length >= 2) {
    // It's become a pinch!
    // In case there are 3+ touches, we ignore all but the "first" two.

    // only screen coordinates can be averaged (data coords could be log scale).
    context.initialPinchCenter = {
      pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
      pageY: 0.5 * (touches[0].pageY + touches[1].pageY),

      // TODO(danvk): remove
      dataX: 0.5 * (touches[0].dataX + touches[1].dataX),
      dataY: 0.5 * (touches[0].dataY + touches[1].dataY)
    };

    // Make pinches in a 45-degree swath around either axis 1-dimensional zooms.
    var initialAngle = 180 / Math.PI * Math.atan2(
        context.initialPinchCenter.pageY - touches[0].pageY,
        touches[0].pageX - context.initialPinchCenter.pageX);

    // use symmetry to get it into the first quadrant.
    initialAngle = Math.abs(initialAngle);
    if (initialAngle > 90) initialAngle = 90 - initialAngle;

    context.touchDirections = {
      x: (initialAngle < (90 - 45/2)),
      y: (initialAngle > 45/2)
    };
  }

  // save the full x & y ranges.
  context.initialRange = {
    x: g.xAxisRange(),
    y: g.yAxisRange()
  };
};

/**
 * @private
 */
Dygraph.Interaction.moveTouch = function(event, g, context) {
  // If the tap moves, then it's definitely not part of a double-tap.
  context.startTimeForDoubleTapMs = null;

  var i, touches = [];
  for (i = 0; i < event.touches.length; i++) {
    var t = event.touches[i];
    touches.push({
      pageX: t.pageX,
      pageY: t.pageY
    });
  }
  var initialTouches = context.initialTouches;

  var c_now;

  // old and new centers.
  var c_init = context.initialPinchCenter;
  if (touches.length == 1) {
    c_now = touches[0];
  } else {
    c_now = {
      pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
      pageY: 0.5 * (touches[0].pageY + touches[1].pageY)
    };
  }

  // this is the "swipe" component
  // we toss it out for now, but could use it in the future.
  var swipe = {
    pageX: c_now.pageX - c_init.pageX,
    pageY: c_now.pageY - c_init.pageY
  };
  var dataWidth = context.initialRange.x[1] - context.initialRange.x[0];
  var dataHeight = context.initialRange.y[0] - context.initialRange.y[1];
  swipe.dataX = (swipe.pageX / g.plotter_.area.w) * dataWidth;
  swipe.dataY = (swipe.pageY / g.plotter_.area.h) * dataHeight;
  var xScale, yScale;

  // The residual bits are usually split into scale & rotate bits, but we split
  // them into x-scale and y-scale bits.
  if (touches.length == 1) {
    xScale = 1.0;
    yScale = 1.0;
  } else if (touches.length >= 2) {
    var initHalfWidth = (initialTouches[1].pageX - c_init.pageX);
    xScale = (touches[1].pageX - c_now.pageX) / initHalfWidth;

    var initHalfHeight = (initialTouches[1].pageY - c_init.pageY);
    yScale = (touches[1].pageY - c_now.pageY) / initHalfHeight;
  }

  // Clip scaling to [1/8, 8] to prevent too much blowup.
  xScale = Math.min(8, Math.max(0.125, xScale));
  yScale = Math.min(8, Math.max(0.125, yScale));

  var didZoom = false;
  if (context.touchDirections.x) {
    g.dateWindow_ = [
      c_init.dataX - swipe.dataX + (context.initialRange.x[0] - c_init.dataX) / xScale,
      c_init.dataX - swipe.dataX + (context.initialRange.x[1] - c_init.dataX) / xScale
    ];
    didZoom = true;
  }
  
  if (context.touchDirections.y) {
    for (i = 0; i < 1  /*g.axes_.length*/; i++) {
      var axis = g.axes_[i];
      var logscale = g.attributes_.getForAxis("logscale", i);
      if (logscale) {
        // TODO(danvk): implement
      } else {
        axis.valueWindow = [
          c_init.dataY - swipe.dataY + (context.initialRange.y[0] - c_init.dataY) / yScale,
          c_init.dataY - swipe.dataY + (context.initialRange.y[1] - c_init.dataY) / yScale
        ];
        didZoom = true;
      }
    }
  }

  g.drawGraph_(false);

  // We only call zoomCallback on zooms, not pans, to mirror desktop behavior.
  if (didZoom && touches.length > 1 && g.attr_('zoomCallback')) {
    var viewWindow = g.xAxisRange();
    g.attr_("zoomCallback")(viewWindow[0], viewWindow[1], g.yAxisRanges());
  }
};

/**
 * @private
 */
Dygraph.Interaction.endTouch = function(event, g, context) {
  if (event.touches.length !== 0) {
    // this is effectively a "reset"
    Dygraph.Interaction.startTouch(event, g, context);
  } else if (event.changedTouches.length == 1) {
    // Could be part of a "double tap"
    // The heuristic here is that it's a double-tap if the two touchend events
    // occur within 500ms and within a 50x50 pixel box.
    var now = new Date().getTime();
    var t = event.changedTouches[0];
    if (context.startTimeForDoubleTapMs &&
        now - context.startTimeForDoubleTapMs < 500 &&
        context.doubleTapX && Math.abs(context.doubleTapX - t.screenX) < 50 &&
        context.doubleTapY && Math.abs(context.doubleTapY - t.screenY) < 50) {
      g.resetZoom();
    } else {
      context.startTimeForDoubleTapMs = now;
      context.doubleTapX = t.screenX;
      context.doubleTapY = t.screenY;
    }
  }
};

/**
 * Default interation model for dygraphs. You can refer to specific elements of
 * this when constructing your own interaction model, e.g.:
 * g.updateOptions( {
 *   interactionModel: {
 *     mousedown: Dygraph.defaultInteractionModel.mousedown
 *   }
 * } );
 */
Dygraph.Interaction.defaultModel = {
  // Track the beginning of drag events
  mousedown: function(event, g, context) {
    // Right-click should not initiate a zoom.
    if (event.button && event.button == 2) return;

    context.initializeMouseDown(event, g, context);

    if (event.altKey || event.shiftKey) {
      Dygraph.startPan(event, g, context);
    } else {
      Dygraph.startZoom(event, g, context);
    }
  },

  // Draw zoom rectangles when the mouse is down and the user moves around
  mousemove: function(event, g, context) {
    if (context.isZooming) {
      Dygraph.moveZoom(event, g, context);
    } else if (context.isPanning) {
      Dygraph.movePan(event, g, context);
    }
  },

  mouseup: function(event, g, context) {
    if (context.isZooming) {
      Dygraph.endZoom(event, g, context);
    } else if (context.isPanning) {
      Dygraph.endPan(event, g, context);
    }
  },

  touchstart: function(event, g, context) {
    Dygraph.Interaction.startTouch(event, g, context);
  },
  touchmove: function(event, g, context) {
    Dygraph.Interaction.moveTouch(event, g, context);
  },
  touchend: function(event, g, context) {
    Dygraph.Interaction.endTouch(event, g, context);
  },

  // Temporarily cancel the dragging event when the mouse leaves the graph
  mouseout: function(event, g, context) {
    if (context.isZooming) {
      context.dragEndX = null;
      context.dragEndY = null;
      g.clearZoomRect_();
    }
  },

  // Disable zooming out if panning.
  dblclick: function(event, g, context) {
    if (context.cancelNextDblclick) {
      context.cancelNextDblclick = false;
      return;
    }
    if (event.altKey || event.shiftKey) {
      return;
    }
    g.resetZoom();
  }
};

Dygraph.DEFAULT_ATTRS.interactionModel = Dygraph.Interaction.defaultModel;

// old ways of accessing these methods/properties
Dygraph.defaultInteractionModel = Dygraph.Interaction.defaultModel;
Dygraph.endZoom = Dygraph.Interaction.endZoom;
Dygraph.moveZoom = Dygraph.Interaction.moveZoom;
Dygraph.startZoom = Dygraph.Interaction.startZoom;
Dygraph.endPan = Dygraph.Interaction.endPan;
Dygraph.movePan = Dygraph.Interaction.movePan;
Dygraph.startPan = Dygraph.Interaction.startPan;

Dygraph.Interaction.nonInteractiveModel_ = {
  mousedown: function(event, g, context) {
    context.initializeMouseDown(event, g, context);
  },
  mouseup: function(event, g, context) {
    // TODO(danvk): this logic is repeated in Dygraph.Interaction.endZoom
    context.dragEndX = g.dragGetX_(event, context);
    context.dragEndY = g.dragGetY_(event, context);
    var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
    var regionHeight = Math.abs(context.dragEndY - context.dragStartY);

    if (regionWidth < 2 && regionHeight < 2 &&
        g.lastx_ !== undefined && g.lastx_ != -1) {
      Dygraph.Interaction.treatMouseOpAsClick(g, event, context);
    }
  }
};

// Default interaction model when using the range selector.
Dygraph.Interaction.dragIsPanInteractionModel = {
  mousedown: function(event, g, context) {
    context.initializeMouseDown(event, g, context);
    Dygraph.startPan(event, g, context);
  },
  mousemove: function(event, g, context) {
    if (context.isPanning) {
      Dygraph.movePan(event, g, context);
    }
  },
  mouseup: function(event, g, context) {
    if (context.isPanning) {
      Dygraph.endPan(event, g, context);
    }
  }
};

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview Description of this file.
 * @author danvk@google.com (Dan Vanderkam)
 *
 * A ticker is a function with the following interface:
 *
 * function(a, b, pixels, options_view, dygraph, forced_values);
 * -> [ { v: tick1_v, label: tick1_label[, label_v: label_v1] },
 *      { v: tick2_v, label: tick2_label[, label_v: label_v2] },
 *      ...
 *    ]
 *
 * The returned value is called a "tick list".
 *
 * Arguments
 * ---------
 *
 * [a, b] is the range of the axis for which ticks are being generated. For a
 * numeric axis, these will simply be numbers. For a date axis, these will be
 * millis since epoch (convertable to Date objects using "new Date(a)" and "new
 * Date(b)").
 *
 * opts provides access to chart- and axis-specific options. It can be used to
 * access number/date formatting code/options, check for a log scale, etc.
 *
 * pixels is the length of the axis in pixels. opts('pixelsPerLabel') is the
 * minimum amount of space to be allotted to each label. For instance, if
 * pixels=400 and opts('pixelsPerLabel')=40 then the ticker should return
 * between zero and ten (400/40) ticks.
 *
 * dygraph is the Dygraph object for which an axis is being constructed.
 *
 * forced_values is used for secondary y-axes. The tick positions are typically
 * set by the primary y-axis, so the secondary y-axis has no choice in where to
 * put these. It simply has to generate labels for these data values.
 *
 * Tick lists
 * ----------
 * Typically a tick will have both a grid/tick line and a label at one end of
 * that line (at the bottom for an x-axis, at left or right for the y-axis).
 *
 * A tick may be missing one of these two components:
 * - If "label_v" is specified instead of "v", then there will be no tick or
 *   gridline, just a label.
 * - Similarly, if "label" is not specified, then there will be a gridline
 *   without a label.
 *
 * This flexibility is useful in a few situations:
 * - For log scales, some of the tick lines may be too close to all have labels.
 * - For date scales where years are being displayed, it is desirable to display
 *   tick marks at the beginnings of years but labels (e.g. "2006") in the
 *   middle of the years.
 */

/*jshint globalstrict:true, sub:true */
/*global Dygraph:false */
"use strict";

/** @typedef {Array.<{v:number, label:string, label_v:(string|undefined)}>} */
Dygraph.TickList = undefined;  // the ' = undefined' keeps jshint happy.

/** @typedef {function(
 *    number,
 *    number,
 *    number,
 *    function(string):*,
 *    Dygraph=,
 *    Array.<number>=
 *  ): Dygraph.TickList}
 */
Dygraph.Ticker = undefined;  // the ' = undefined' keeps jshint happy.

/** @type {Dygraph.Ticker} */
Dygraph.numericLinearTicks = function(a, b, pixels, opts, dygraph, vals) {
  var nonLogscaleOpts = function(opt) {
    if (opt === 'logscale') return false;
    return opts(opt);
  };
  return Dygraph.numericTicks(a, b, pixels, nonLogscaleOpts, dygraph, vals);
};

/** @type {Dygraph.Ticker} */
Dygraph.numericTicks = function(a, b, pixels, opts, dygraph, vals) {
  var pixels_per_tick = /** @type{number} */(opts('pixelsPerLabel'));
  var ticks = [];
  var i, j, tickV, nTicks;
  if (vals) {
    for (i = 0; i < vals.length; i++) {
      ticks.push({v: vals[i]});
    }
  } else {
    // TODO(danvk): factor this log-scale block out into a separate function.
    if (opts("logscale")) {
      nTicks  = Math.floor(pixels / pixels_per_tick);
      var minIdx = Dygraph.binarySearch(a, Dygraph.PREFERRED_LOG_TICK_VALUES, 1);
      var maxIdx = Dygraph.binarySearch(b, Dygraph.PREFERRED_LOG_TICK_VALUES, -1);
      if (minIdx == -1) {
        minIdx = 0;
      }
      if (maxIdx == -1) {
        maxIdx = Dygraph.PREFERRED_LOG_TICK_VALUES.length - 1;
      }
      // Count the number of tick values would appear, if we can get at least
      // nTicks / 4 accept them.
      var lastDisplayed = null;
      if (maxIdx - minIdx >= nTicks / 4) {
        for (var idx = maxIdx; idx >= minIdx; idx--) {
          var tickValue = Dygraph.PREFERRED_LOG_TICK_VALUES[idx];
          var pixel_coord = Math.log(tickValue / a) / Math.log(b / a) * pixels;
          var tick = { v: tickValue };
          if (lastDisplayed === null) {
            lastDisplayed = {
              tickValue : tickValue,
              pixel_coord : pixel_coord
            };
          } else {
            if (Math.abs(pixel_coord - lastDisplayed.pixel_coord) >= pixels_per_tick) {
              lastDisplayed = {
                tickValue : tickValue,
                pixel_coord : pixel_coord
              };
            } else {
              tick.label = "";
            }
          }
          ticks.push(tick);
        }
        // Since we went in backwards order.
        ticks.reverse();
      }
    }

    // ticks.length won't be 0 if the log scale function finds values to insert.
    if (ticks.length === 0) {
      // Basic idea:
      // Try labels every 1, 2, 5, 10, 20, 50, 100, etc.
      // Calculate the resulting tick spacing (i.e. this.height_ / nTicks).
      // The first spacing greater than pixelsPerYLabel is what we use.
      // TODO(danvk): version that works on a log scale.
      var kmg2 = opts("labelsKMG2");
      var mults, base;
      if (kmg2) {
        mults = [1, 2, 4, 8, 16, 32, 64, 128, 256];
        base = 16;
      } else {
        mults = [1, 2, 5, 10, 20, 50, 100];
        base = 10;
      }

      // Get the maximum number of permitted ticks based on the
      // graph's pixel size and pixels_per_tick setting.
      var max_ticks = Math.ceil(pixels / pixels_per_tick);

      // Now calculate the data unit equivalent of this tick spacing.
      // Use abs() since graphs may have a reversed Y axis.
      var units_per_tick = Math.abs(b - a) / max_ticks;

      // Based on this, get a starting scale which is the largest
      // integer power of the chosen base (10 or 16) that still remains
      // below the requested pixels_per_tick spacing.
      var base_power = Math.floor(Math.log(units_per_tick) / Math.log(base));
      var base_scale = Math.pow(base, base_power);

      // Now try multiples of the starting scale until we find one
      // that results in tick marks spaced sufficiently far apart.
      // The "mults" array should cover the range 1 .. base^2 to
      // adjust for rounding and edge effects.
      var scale, low_val, high_val, spacing;
      for (j = 0; j < mults.length; j++) {
        scale = base_scale * mults[j];
        low_val = Math.floor(a / scale) * scale;
        high_val = Math.ceil(b / scale) * scale;
        nTicks = Math.abs(high_val - low_val) / scale;
        spacing = pixels / nTicks;
        if (spacing > pixels_per_tick) break;
      }

      // Construct the set of ticks.
      // Allow reverse y-axis if it's explicitly requested.
      if (low_val > high_val) scale *= -1;
      for (i = 0; i < nTicks; i++) {
        tickV = low_val + i * scale;
        ticks.push( {v: tickV} );
      }
    }
  }

  var formatter = /**@type{AxisLabelFormatter}*/(opts('axisLabelFormatter'));

  // Add labels to the ticks.
  for (i = 0; i < ticks.length; i++) {
    if (ticks[i].label !== undefined) continue;  // Use current label.
    // TODO(danvk): set granularity to something appropriate here.
    ticks[i].label = formatter(ticks[i].v, 0, opts, dygraph);
  }

  return ticks;
};


/** @type {Dygraph.Ticker} */
Dygraph.dateTicker = function(a, b, pixels, opts, dygraph, vals) {
  var chosen = Dygraph.pickDateTickGranularity(a, b, pixels, opts);

  if (chosen >= 0) {
    return Dygraph.getDateAxis(a, b, chosen, opts, dygraph);
  } else {
    // this can happen if self.width_ is zero.
    return [];
  }
};

// Time granularity enumeration
// TODO(danvk): make this an @enum
Dygraph.SECONDLY = 0;
Dygraph.TWO_SECONDLY = 1;
Dygraph.FIVE_SECONDLY = 2;
Dygraph.TEN_SECONDLY = 3;
Dygraph.THIRTY_SECONDLY  = 4;
Dygraph.MINUTELY = 5;
Dygraph.TWO_MINUTELY = 6;
Dygraph.FIVE_MINUTELY = 7;
Dygraph.TEN_MINUTELY = 8;
Dygraph.THIRTY_MINUTELY = 9;
Dygraph.HOURLY = 10;
Dygraph.TWO_HOURLY = 11;
Dygraph.SIX_HOURLY = 12;
Dygraph.DAILY = 13;
Dygraph.WEEKLY = 14;
Dygraph.MONTHLY = 15;
Dygraph.QUARTERLY = 16;
Dygraph.BIANNUAL = 17;
Dygraph.ANNUAL = 18;
Dygraph.DECADAL = 19;
Dygraph.CENTENNIAL = 20;
Dygraph.NUM_GRANULARITIES = 21;

/** @type {Array.<number>} */
Dygraph.SHORT_SPACINGS = [];
Dygraph.SHORT_SPACINGS[Dygraph.SECONDLY]        = 1000 * 1;
Dygraph.SHORT_SPACINGS[Dygraph.TWO_SECONDLY]    = 1000 * 2;
Dygraph.SHORT_SPACINGS[Dygraph.FIVE_SECONDLY]   = 1000 * 5;
Dygraph.SHORT_SPACINGS[Dygraph.TEN_SECONDLY]    = 1000 * 10;
Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_SECONDLY] = 1000 * 30;
Dygraph.SHORT_SPACINGS[Dygraph.MINUTELY]        = 1000 * 60;
Dygraph.SHORT_SPACINGS[Dygraph.TWO_MINUTELY]    = 1000 * 60 * 2;
Dygraph.SHORT_SPACINGS[Dygraph.FIVE_MINUTELY]   = 1000 * 60 * 5;
Dygraph.SHORT_SPACINGS[Dygraph.TEN_MINUTELY]    = 1000 * 60 * 10;
Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_MINUTELY] = 1000 * 60 * 30;
Dygraph.SHORT_SPACINGS[Dygraph.HOURLY]          = 1000 * 3600;
Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY]      = 1000 * 3600 * 2;
Dygraph.SHORT_SPACINGS[Dygraph.SIX_HOURLY]      = 1000 * 3600 * 6;
Dygraph.SHORT_SPACINGS[Dygraph.DAILY]           = 1000 * 86400;
Dygraph.SHORT_SPACINGS[Dygraph.WEEKLY]          = 1000 * 604800;

/** 
 * A collection of objects specifying where it is acceptable to place tick
 * marks for granularities larger than WEEKLY.  
 * 'months' is an array of month indexes on which to place tick marks.
 * 'year_mod' ticks are placed when year % year_mod = 0.
 * @type {Array.<Object>} 
 */
Dygraph.LONG_TICK_PLACEMENTS = [];
Dygraph.LONG_TICK_PLACEMENTS[Dygraph.MONTHLY] = {
  months : [0,1,2,3,4,5,6,7,8,9,10,11], 
  year_mod : 1
};
Dygraph.LONG_TICK_PLACEMENTS[Dygraph.QUARTERLY] = {
  months: [0,3,6,9], 
  year_mod: 1
};
Dygraph.LONG_TICK_PLACEMENTS[Dygraph.BIANNUAL] = {
  months: [0,6], 
  year_mod: 1
};
Dygraph.LONG_TICK_PLACEMENTS[Dygraph.ANNUAL] = {
  months: [0], 
  year_mod: 1
};
Dygraph.LONG_TICK_PLACEMENTS[Dygraph.DECADAL] = {
  months: [0], 
  year_mod: 10
};
Dygraph.LONG_TICK_PLACEMENTS[Dygraph.CENTENNIAL] = {
  months: [0], 
  year_mod: 100
};

/**
 * This is a list of human-friendly values at which to show tick marks on a log
 * scale. It is k * 10^n, where k=1..9 and n=-39..+39, so:
 * ..., 1, 2, 3, 4, 5, ..., 9, 10, 20, 30, ..., 90, 100, 200, 300, ...
 * NOTE: this assumes that Dygraph.LOG_SCALE = 10.
 * @type {Array.<number>}
 */
Dygraph.PREFERRED_LOG_TICK_VALUES = function() {
  var vals = [];
  for (var power = -39; power <= 39; power++) {
    var range = Math.pow(10, power);
    for (var mult = 1; mult <= 9; mult++) {
      var val = range * mult;
      vals.push(val);
    }
  }
  return vals;
}();

/**
 * Determine the correct granularity of ticks on a date axis.
 *
 * @param {number} a Left edge of the chart (ms)
 * @param {number} b Right edge of the chart (ms)
 * @param {number} pixels Size of the chart in the relevant dimension (width).
 * @param {function(string):*} opts Function mapping from option name ->
 *     value.
 * @return {number} The appropriate axis granularity for this chart. See the
 *     enumeration of possible values in dygraph-tickers.js.
 */
Dygraph.pickDateTickGranularity = function(a, b, pixels, opts) {
  var pixels_per_tick = /** @type{number} */(opts('pixelsPerLabel'));
  for (var i = 0; i < Dygraph.NUM_GRANULARITIES; i++) {
    var num_ticks = Dygraph.numDateTicks(a, b, i);
    if (pixels / num_ticks >= pixels_per_tick) {
      return i;
    }
  }
  return -1;
};

/**
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} granularity (one of the granularities enumerated above)
 * @return {number} Number of ticks that would result.
 */
Dygraph.numDateTicks = function(start_time, end_time, granularity) {
  if (granularity < Dygraph.MONTHLY) {
    // Generate one tick mark for every fixed interval of time.
    var spacing = Dygraph.SHORT_SPACINGS[granularity];
    return Math.floor(0.5 + 1.0 * (end_time - start_time) / spacing);
  } else {
    var tickPlacement = Dygraph.LONG_TICK_PLACEMENTS[granularity];

    var msInYear = 365.2524 * 24 * 3600 * 1000;
    var num_years = 1.0 * (end_time - start_time) / msInYear;
    return Math.floor(0.5 + 1.0 * num_years * tickPlacement.months.length / tickPlacement.year_mod);
  }
};

/**
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} granularity (one of the granularities enumerated above)
 * @param {function(string):*} opts Function mapping from option name -&gt; value.
 * @param {Dygraph=} dg
 * @return {!Dygraph.TickList}
 */
Dygraph.getDateAxis = function(start_time, end_time, granularity, opts, dg) {
  var formatter = /** @type{AxisLabelFormatter} */(
      opts("axisLabelFormatter"));
  var ticks = [];
  var t;

  if (granularity < Dygraph.MONTHLY) {
    // Generate one tick mark for every fixed interval of time.
    var spacing = Dygraph.SHORT_SPACINGS[granularity];

    // Find a time less than start_time which occurs on a "nice" time boundary
    // for this granularity.
    var g = spacing / 1000;
    var d = new Date(start_time);
    Dygraph.setDateSameTZ(d, {ms: 0});

    var x;
    if (g <= 60) {  // seconds
      x = d.getSeconds();
      Dygraph.setDateSameTZ(d, {s: x - x % g});
    } else {
      Dygraph.setDateSameTZ(d, {s: 0});
      g /= 60;
      if (g <= 60) {  // minutes
        x = d.getMinutes();
        Dygraph.setDateSameTZ(d, {m: x - x % g});
      } else {
        Dygraph.setDateSameTZ(d, {m: 0});
        g /= 60;

        if (g <= 24) {  // days
          x = d.getHours();
          d.setHours(x - x % g);
        } else {
          d.setHours(0);
          g /= 24;

          if (g == 7) {  // one week
            d.setDate(d.getDate() - d.getDay());
          }
        }
      }
    }
    start_time = d.getTime();

    // For spacings coarser than two-hourly, we want to ignore daylight
    // savings transitions to get consistent ticks. For finer-grained ticks,
    // it's essential to show the DST transition in all its messiness.
    var start_offset_min = new Date(start_time).getTimezoneOffset();
    var check_dst = (spacing >= Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY]);

    for (t = start_time; t <= end_time; t += spacing) {
      d = new Date(t);

      // This ensures that we stay on the same hourly "rhythm" across
      // daylight savings transitions. Without this, the ticks could get off
      // by an hour. See tests/daylight-savings.html or issue 147.
      if (check_dst && d.getTimezoneOffset() != start_offset_min) {
        var delta_min = d.getTimezoneOffset() - start_offset_min;
        t += delta_min * 60 * 1000;
        d = new Date(t);
        start_offset_min = d.getTimezoneOffset();

        // Check whether we've backed into the previous timezone again.
        // This can happen during a "spring forward" transition. In this case,
        // it's best to skip this tick altogether (we may be shooting for a
        // non-existent time like the 2AM that's skipped) and go to the next
        // one.
        if (new Date(t + spacing).getTimezoneOffset() != start_offset_min) {
          t += spacing;
          d = new Date(t);
          start_offset_min = d.getTimezoneOffset();
        }
      }

      ticks.push({ v:t,
                   label: formatter(d, granularity, opts, dg)
                 });
    }
  } else {
    // Display a tick mark on the first of a set of months of each year.
    // Years get a tick mark iff y % year_mod == 0. This is useful for
    // displaying a tick mark once every 10 years, say, on long time scales.
    var months;
    var year_mod = 1;  // e.g. to only print one point every 10 years.

    if (granularity < Dygraph.NUM_GRANULARITIES) {
      months = Dygraph.LONG_TICK_PLACEMENTS[granularity].months;
      year_mod = Dygraph.LONG_TICK_PLACEMENTS[granularity].year_mod;
    } else {
      Dygraph.warn("Span of dates is too long");
    }

    var start_year = new Date(start_time).getFullYear();
    var end_year   = new Date(end_time).getFullYear();
    var zeropad = Dygraph.zeropad;
    for (var i = start_year; i <= end_year; i++) {
      if (i % year_mod !== 0) continue;
      for (var j = 0; j < months.length; j++) {
        var date_str = i + "/" + zeropad(1 + months[j]) + "/01";
        t = Dygraph.dateStrToMillis(date_str);
        if (t < start_time || t > end_time) continue;
        ticks.push({ v:t,
                     label: formatter(new Date(t), granularity, opts, dg)
                   });
      }
    }
  }

  return ticks;
};

// These are set here so that this file can be included after dygraph.js
// or independently.
if (Dygraph &&
    Dygraph.DEFAULT_ATTRS &&
    Dygraph.DEFAULT_ATTRS['axes'] &&
    Dygraph.DEFAULT_ATTRS['axes']['x'] &&
    Dygraph.DEFAULT_ATTRS['axes']['y'] &&
    Dygraph.DEFAULT_ATTRS['axes']['y2']) {
  Dygraph.DEFAULT_ATTRS['axes']['x']['ticker'] = Dygraph.dateTicker;
  Dygraph.DEFAULT_ATTRS['axes']['y']['ticker'] = Dygraph.numericTicks;
  Dygraph.DEFAULT_ATTRS['axes']['y2']['ticker'] = Dygraph.numericTicks;
}

/*global Dygraph:false */

// Namespace for plugins. Load this before plugins/*.js files.
Dygraph.Plugins = {};

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/*global Dygraph:false */

Dygraph.Plugins.Annotations = (function() {

"use strict";

/**
Current bits of jankiness:
- Uses dygraph.layout_ to get the parsed annotations.
- Uses dygraph.plotter_.area

It would be nice if the plugin didn't require so much special support inside
the core dygraphs classes, but annotations involve quite a bit of parsing and
layout.

TODO(danvk): cache DOM elements.

*/

var annotations = function() {
  this.annotations_ = [];
};

annotations.prototype.toString = function() {
  return "Annotations Plugin";
};

annotations.prototype.activate = function(g) {
  return {
    clearChart: this.clearChart,
    didDrawChart: this.didDrawChart
  };
};

annotations.prototype.detachLabels = function() {
  for (var i = 0; i < this.annotations_.length; i++) {
    var a = this.annotations_[i];
    if (a.parentNode) a.parentNode.removeChild(a);
    this.annotations_[i] = null;
  }
  this.annotations_ = [];
};

annotations.prototype.clearChart = function(e) {
  this.detachLabels();
};

annotations.prototype.didDrawChart = function(e) {
  var g = e.dygraph;

  // Early out in the (common) case of zero annotations.
  var points = g.layout_.annotated_points;
  if (!points || points.length === 0) return;

  var containerDiv = e.canvas.parentNode;
  var annotationStyle = {
    "position": "absolute",
    "fontSize": g.getOption('axisLabelFontSize') + "px",
    "zIndex": 10,
    "overflow": "hidden"
  };

  var bindEvt = function(eventName, classEventName, pt) {
    return function(annotation_event) {
      var a = pt.annotation;
      if (a.hasOwnProperty(eventName)) {
        a[eventName](a, pt, g, annotation_event);
      } else if (g.getOption(classEventName)) {
        g.getOption(classEventName)(a, pt, g, annotation_event );
      }
    };
  };

  // Add the annotations one-by-one.
  var area = e.dygraph.plotter_.area;

  // x-coord to sum of previous annotation's heights (used for stacking).
  var xToUsedHeight = {};

  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    if (p.canvasx < area.x || p.canvasx > area.x + area.w ||
        p.canvasy < area.y || p.canvasy > area.y + area.h) {
      continue;
    }

    var a = p.annotation;
    var tick_height = 6;
    if (a.hasOwnProperty("tickHeight")) {
      tick_height = a.tickHeight;
    }

    var div = document.createElement("div");
    for (var name in annotationStyle) {
      if (annotationStyle.hasOwnProperty(name)) {
        div.style[name] = annotationStyle[name];
      }
    }
    if (!a.hasOwnProperty('icon')) {
      div.className = "dygraphDefaultAnnotation";
    }
    if (a.hasOwnProperty('cssClass')) {
      div.className += " " + a.cssClass;
    }

    var width = a.hasOwnProperty('width') ? a.width : 16;
    var height = a.hasOwnProperty('height') ? a.height : 16;
    if (a.hasOwnProperty('icon')) {
      var img = document.createElement("img");
      img.src = a.icon;
      img.width = width;
      img.height = height;
      div.appendChild(img);
    } else if (p.annotation.hasOwnProperty('shortText')) {
      div.appendChild(document.createTextNode(p.annotation.shortText));
    }
    var left = p.canvasx - width / 2;
    div.style.left = left + "px";
    var divTop = 0;
    if (a.attachAtBottom) {
      var y = (area.y + area.h - height - tick_height);
      if (xToUsedHeight[left]) {
        y -= xToUsedHeight[left];
      } else {
        xToUsedHeight[left] = 0;
      }
      xToUsedHeight[left] += (tick_height + height);
      divTop = y;
    } else {
      divTop = p.canvasy - height - tick_height;
    }
    div.style.top = divTop + "px";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.title = p.annotation.text;
    div.style.color = g.colorsMap_[p.name];
    div.style.borderColor = g.colorsMap_[p.name];
    a.div = div;

    g.addAndTrackEvent(div, 'click',
        bindEvt('clickHandler', 'annotationClickHandler', p, this));
    g.addAndTrackEvent(div, 'mouseover',
        bindEvt('mouseOverHandler', 'annotationMouseOverHandler', p, this));
    g.addAndTrackEvent(div, 'mouseout',
        bindEvt('mouseOutHandler', 'annotationMouseOutHandler', p, this));
    g.addAndTrackEvent(div, 'dblclick',
        bindEvt('dblClickHandler', 'annotationDblClickHandler', p, this));

    containerDiv.appendChild(div);
    this.annotations_.push(div);

    var ctx = e.drawingContext;
    ctx.save();
    ctx.strokeStyle = g.colorsMap_[p.name];
    ctx.beginPath();
    if (!a.attachAtBottom) {
      ctx.moveTo(p.canvasx, p.canvasy);
      ctx.lineTo(p.canvasx, p.canvasy - 2 - tick_height);
    } else {
      var y = divTop + height;
      ctx.moveTo(p.canvasx, y);
      ctx.lineTo(p.canvasx, y + tick_height);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
};

annotations.prototype.destroy = function() {
  this.detachLabels();
};

return annotations;

})();

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/*global Dygraph:false */

Dygraph.Plugins.Axes = (function() {

"use strict";

/*
Bits of jankiness:
- Direct layout access
- Direct area access
- Should include calculation of ticks, not just the drawing.

Options left to make axis-friendly.
  ('axisTickSize')
  ('drawAxesAtZero')
  ('xAxisHeight')

These too. What is the difference between axisLablelWidth and {x,y}AxisLabelWidth?
  ('axisLabelWidth')
  ('xAxisLabelWidth')
  ('yAxisLabelWidth')
*/

/**
 * Draws the axes. This includes the labels on the x- and y-axes, as well
 * as the tick marks on the axes.
 * It does _not_ draw the grid lines which span the entire chart.
 */
var axes = function() {
  this.xlabels_ = [];
  this.ylabels_ = [];
};

axes.prototype.toString = function() {
  return "Axes Plugin";
};

axes.prototype.activate = function(g) {
  return {
    layout: this.layout,
    clearChart: this.clearChart,
    willDrawChart: this.willDrawChart
  };
};

axes.prototype.layout = function(e) {
  var g = e.dygraph;

  if (g.getOption('drawYAxis')) {
    var w = g.getOption('yAxisLabelWidth') + 2 * g.getOption('axisTickSize');
    e.reserveSpaceLeft(w);
  }

  if (g.getOption('drawXAxis')) {
    var h;
    // NOTE: I think this is probably broken now, since g.getOption() now
    // hits the dictionary. (That is, g.getOption('xAxisHeight') now always
    // has a value.)
    if (g.getOption('xAxisHeight')) {
      h = g.getOption('xAxisHeight');
    } else {
      h = g.getOptionForAxis('axisLabelFontSize', 'x') + 2 * g.getOption('axisTickSize');
    }
    e.reserveSpaceBottom(h);
  }

  if (g.numAxes() == 2) {
    // TODO(danvk): introduce a 'drawAxis' per-axis property.
    if (g.getOption('drawYAxis')) {
      // TODO(danvk): per-axis setting.
      var w = g.getOption('yAxisLabelWidth') + 2 * g.getOption('axisTickSize');
      e.reserveSpaceRight(w);
    }
  } else if (g.numAxes() > 2) {
    g.error("Only two y-axes are supported at this time. (Trying " +
            "to use " + g.numAxes() + ")");
  }
};

axes.prototype.detachLabels = function() {
  function removeArray(ary) {
    for (var i = 0; i < ary.length; i++) {
      var el = ary[i];
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }

  removeArray(this.xlabels_);
  removeArray(this.ylabels_);
  this.xlabels_ = [];
  this.ylabels_ = [];
};

axes.prototype.clearChart = function(e) {
  this.detachLabels();
};

axes.prototype.willDrawChart = function(e) {
  var g = e.dygraph;
  if (!g.getOption('drawXAxis') && !g.getOption('drawYAxis')) return;
  
  // Round pixels to half-integer boundaries for crisper drawing.
  function halfUp(x)  { return Math.round(x) + 0.5; }
  function halfDown(y){ return Math.round(y) - 0.5; }

  var context = e.drawingContext;
  var containerDiv = e.canvas.parentNode;
  var canvasWidth = e.canvas.width;
  var canvasHeight = e.canvas.height;

  var label, x, y, tick, i;

  var makeLabelStyle = function(axis) {
    return {
      position: "absolute",
      fontSize: g.getOptionForAxis('axisLabelFontSize', axis) + "px",
      zIndex: 10,
      color: g.getOptionForAxis('axisLabelColor', axis),
      width: g.getOption('axisLabelWidth') + "px",
      // height: g.getOptionForAxis('axisLabelFontSize', 'x') + 2 + "px",
      lineHeight: "normal",  // Something other than "normal" line-height screws up label positioning.
      overflow: "hidden"
    };
  };

  var labelStyles = {
    x : makeLabelStyle('x'),
    y : makeLabelStyle('y'),
    y2 : makeLabelStyle('y2')
  };

  var makeDiv = function(txt, axis, prec_axis) {
    /*
     * This seems to be called with the following three sets of axis/prec_axis:
     * x: undefined
     * y: y1
     * y: y2
     */
    var div = document.createElement("div");
    var labelStyle = labelStyles[prec_axis == 'y2' ? 'y2' : axis];
    for (var name in labelStyle) {
      if (labelStyle.hasOwnProperty(name)) {
        div.style[name] = labelStyle[name];
      }
    }
    var inner_div = document.createElement("div");
    inner_div.className = 'dygraph-axis-label' +
                          ' dygraph-axis-label-' + axis +
                          (prec_axis ? ' dygraph-axis-label-' + prec_axis : '');
    inner_div.innerHTML = txt;
    div.appendChild(inner_div);
    return div;
  };

  // axis lines
  context.save();

  var layout = g.layout_;
  var area = e.dygraph.plotter_.area;

  if (g.getOption('drawYAxis')) {
    if (layout.yticks && layout.yticks.length > 0) {
      var num_axes = g.numAxes();
      for (i = 0; i < layout.yticks.length; i++) {
        tick = layout.yticks[i];
        if (typeof(tick) == "function") return;
        x = area.x;
        var sgn = 1;
        var prec_axis = 'y1';
        if (tick[0] == 1) {  // right-side y-axis
          x = area.x + area.w;
          sgn = -1;
          prec_axis = 'y2';
        }
        var fontSize = g.getOptionForAxis('axisLabelFontSize', prec_axis);
        y = area.y + tick[1] * area.h;

        /* Tick marks are currently clipped, so don't bother drawing them.
        context.beginPath();
        context.moveTo(halfUp(x), halfDown(y));
        context.lineTo(halfUp(x - sgn * this.attr_('axisTickSize')), halfDown(y));
        context.closePath();
        context.stroke();
        */

        label = makeDiv(tick[2], 'y', num_axes == 2 ? prec_axis : null);
        var top = (y - fontSize / 2);
        if (top < 0) top = 0;

        if (top + fontSize + 3 > canvasHeight) {
          label.style.bottom = "0px";
        } else {
          label.style.top = top + "px";
        }
        if (tick[0] === 0) {
          label.style.left = (area.x - g.getOption('yAxisLabelWidth') - g.getOption('axisTickSize')) + "px";
          label.style.textAlign = "right";
        } else if (tick[0] == 1) {
          label.style.left = (area.x + area.w +
                              g.getOption('axisTickSize')) + "px";
          label.style.textAlign = "left";
        }
        label.style.width = g.getOption('yAxisLabelWidth') + "px";
        containerDiv.appendChild(label);
        this.ylabels_.push(label);
      }

      // The lowest tick on the y-axis often overlaps with the leftmost
      // tick on the x-axis. Shift the bottom tick up a little bit to
      // compensate if necessary.
      var bottomTick = this.ylabels_[0];
      // Interested in the y2 axis also?
      var fontSize = g.getOptionForAxis('axisLabelFontSize', "y");
      var bottom = parseInt(bottomTick.style.top, 10) + fontSize;
      if (bottom > canvasHeight - fontSize) {
        bottomTick.style.top = (parseInt(bottomTick.style.top, 10) -
            fontSize / 2) + "px";
      }
    }

    // draw a vertical line on the left to separate the chart from the labels.
    var axisX;
    if (g.getOption('drawAxesAtZero')) {
      var r = g.toPercentXCoord(0);
      if (r > 1 || r < 0 || isNaN(r)) r = 0;
      axisX = halfUp(area.x + r * area.w);
    } else {
      axisX = halfUp(area.x);
    }

    context.strokeStyle = g.getOptionForAxis('axisLineColor', 'y');
    context.lineWidth = g.getOptionForAxis('axisLineWidth', 'y');

    context.beginPath();
    context.moveTo(axisX, halfDown(area.y));
    context.lineTo(axisX, halfDown(area.y + area.h));
    context.closePath();
    context.stroke();

    // if there's a secondary y-axis, draw a vertical line for that, too.
    if (g.numAxes() == 2) {
      context.strokeStyle = g.getOptionForAxis('axisLineColor', 'y2');
      context.lineWidth = g.getOptionForAxis('axisLineWidth', 'y2');
      context.beginPath();
      context.moveTo(halfDown(area.x + area.w), halfDown(area.y));
      context.lineTo(halfDown(area.x + area.w), halfDown(area.y + area.h));
      context.closePath();
      context.stroke();
    }
  }

  if (g.getOption('drawXAxis')) {
    if (layout.xticks) {
      for (i = 0; i < layout.xticks.length; i++) {
        tick = layout.xticks[i];
        x = area.x + tick[0] * area.w;
        y = area.y + area.h;

        /* Tick marks are currently clipped, so don't bother drawing them.
        context.beginPath();
        context.moveTo(halfUp(x), halfDown(y));
        context.lineTo(halfUp(x), halfDown(y + this.attr_('axisTickSize')));
        context.closePath();
        context.stroke();
        */

        label = makeDiv(tick[1], 'x');
        label.style.textAlign = "center";
        label.style.top = (y + g.getOption('axisTickSize')) + 'px';

        var left = (x - g.getOption('axisLabelWidth')/2);
        if (left + g.getOption('axisLabelWidth') > canvasWidth) {
          left = canvasWidth - g.getOption('xAxisLabelWidth');
          label.style.textAlign = "right";
        }
        if (left < 0) {
          left = 0;
          label.style.textAlign = "left";
        }

        label.style.left = left + "px";
        label.style.width = g.getOption('xAxisLabelWidth') + "px";
        containerDiv.appendChild(label);
        this.xlabels_.push(label);
      }
    }

    context.strokeStyle = g.getOptionForAxis('axisLineColor', 'x');
    context.lineWidth = g.getOptionForAxis('axisLineWidth', 'x');
    context.beginPath();
    var axisY;
    if (g.getOption('drawAxesAtZero')) {
      var r = g.toPercentYCoord(0, 0);
      if (r > 1 || r < 0) r = 1;
      axisY = halfDown(area.y + r * area.h);
    } else {
      axisY = halfDown(area.y + area.h);
    }
    context.moveTo(halfUp(area.x), axisY);
    context.lineTo(halfUp(area.x + area.w), axisY);
    context.closePath();
    context.stroke();
  }

  context.restore();
};

return axes;
})();

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */
/*global Dygraph:false */

Dygraph.Plugins.ChartLabels = (function() {

"use strict";

// TODO(danvk): move chart label options out of dygraphs and into the plugin.
// TODO(danvk): only tear down & rebuild the DIVs when it's necessary.

var chart_labels = function() {
  this.title_div_ = null;
  this.xlabel_div_ = null;
  this.ylabel_div_ = null;
  this.y2label_div_ = null;
};

chart_labels.prototype.toString = function() {
  return "ChartLabels Plugin";
};

chart_labels.prototype.activate = function(g) {
  return {
    layout: this.layout,
    // clearChart: this.clearChart,
    didDrawChart: this.didDrawChart
  };
};

// QUESTION: should there be a plugin-utils.js?
var createDivInRect = function(r) {
  var div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.left = r.x + 'px';
  div.style.top = r.y + 'px';
  div.style.width = r.w + 'px';
  div.style.height = r.h + 'px';
  return div;
};

// Detach and null out any existing nodes.
chart_labels.prototype.detachLabels_ = function() {
  var els = [ this.title_div_,
              this.xlabel_div_,
              this.ylabel_div_,
              this.y2label_div_ ];
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (!el) continue;
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  this.title_div_ = null;
  this.xlabel_div_ = null;
  this.ylabel_div_ = null;
  this.y2label_div_ = null;
};

var createRotatedDiv = function(g, box, axis, classes, html) {
  // TODO(danvk): is this outer div actually necessary?
  var div = document.createElement("div");
  div.style.position = 'absolute';
  if (axis == 1) {
    // NOTE: this is cheating. Should be positioned relative to the box.
    div.style.left = '0px';
  } else {
    div.style.left = box.x + 'px';
  }
  div.style.top = box.y + 'px';
  div.style.width = box.w + 'px';
  div.style.height = box.h + 'px';
  div.style.fontSize = (g.getOption('yLabelWidth') - 2) + 'px';

  var inner_div = document.createElement("div");
  inner_div.style.position = 'absolute';
  inner_div.style.width = box.h + 'px';
  inner_div.style.height = box.w + 'px';
  inner_div.style.top = (box.h / 2 - box.w / 2) + 'px';
  inner_div.style.left = (box.w / 2 - box.h / 2) + 'px';
  inner_div.style.textAlign = 'center';

  // CSS rotation is an HTML5 feature which is not standardized. Hence every
  // browser has its own name for the CSS style.
  var val = 'rotate(' + (axis == 1 ? '-' : '') + '90deg)';
  inner_div.style.transform = val;        // HTML5
  inner_div.style.WebkitTransform = val;  // Safari/Chrome
  inner_div.style.MozTransform = val;     // Firefox
  inner_div.style.OTransform = val;       // Opera
  inner_div.style.msTransform = val;      // IE9

  if (typeof(document.documentMode) !== 'undefined' &&
      document.documentMode < 9) {
    // We're dealing w/ an old version of IE, so we have to rotate the text
    // using a BasicImage transform. This uses a different origin of rotation
    // than HTML5 rotation (top left of div vs. its center).
    inner_div.style.filter =
        'progid:DXImageTransform.Microsoft.BasicImage(rotation=' +
        (axis == 1 ? '3' : '1') + ')';
    inner_div.style.left = '0px';
    inner_div.style.top = '0px';
  }

  var class_div = document.createElement("div");
  class_div.className = classes;
  class_div.innerHTML = html;

  inner_div.appendChild(class_div);
  div.appendChild(inner_div);
  return div;
};

chart_labels.prototype.layout = function(e) {
  this.detachLabels_();

  var g = e.dygraph;
  var div = e.chart_div;
  if (g.getOption('title')) {
    // QUESTION: should this return an absolutely-positioned div instead?
    var title_rect = e.reserveSpaceTop(g.getOption('titleHeight'));
    this.title_div_ = createDivInRect(title_rect);
    this.title_div_.style.textAlign = 'center';
    this.title_div_.style.fontSize = (g.getOption('titleHeight') - 8) + 'px';
    this.title_div_.style.fontWeight = 'bold';
    this.title_div_.style.zIndex = 10;

    var class_div = document.createElement("div");
    class_div.className = 'dygraph-label dygraph-title';
    class_div.innerHTML = g.getOption('title');
    this.title_div_.appendChild(class_div);
    div.appendChild(this.title_div_);
  }

  if (g.getOption('xlabel')) {
    var x_rect = e.reserveSpaceBottom(g.getOption('xLabelHeight'));
    this.xlabel_div_ = createDivInRect(x_rect);
    this.xlabel_div_.style.textAlign = 'center';
    this.xlabel_div_.style.fontSize = (g.getOption('xLabelHeight') - 2) + 'px';

    var class_div = document.createElement("div");
    class_div.className = 'dygraph-label dygraph-xlabel';
    class_div.innerHTML = g.getOption('xlabel');
    this.xlabel_div_.appendChild(class_div);
    div.appendChild(this.xlabel_div_);
  }

  if (g.getOption('ylabel')) {
    // It would make sense to shift the chart here to make room for the y-axis
    // label, but the default yAxisLabelWidth is large enough that this results
    // in overly-padded charts. The y-axis label should fit fine. If it
    // doesn't, the yAxisLabelWidth option can be increased.
    var y_rect = e.reserveSpaceLeft(0);

    this.ylabel_div_ = createRotatedDiv(
        g, y_rect,
        1,  // primary (left) y-axis
        'dygraph-label dygraph-ylabel',
        g.getOption('ylabel'));
    div.appendChild(this.ylabel_div_);
  }

  if (g.getOption('y2label') && g.numAxes() == 2) {
    // same logic applies here as for ylabel.
    var y2_rect = e.reserveSpaceRight(0);
    this.y2label_div_ = createRotatedDiv(
        g, y2_rect,
        2,  // secondary (right) y-axis
        'dygraph-label dygraph-y2label',
        g.getOption('y2label'));
    div.appendChild(this.y2label_div_);
  }
};

chart_labels.prototype.didDrawChart = function(e) {
  var g = e.dygraph;
  if (this.title_div_) {
    this.title_div_.children[0].innerHTML = g.getOption('title');
  }
  if (this.xlabel_div_) {
    this.xlabel_div_.children[0].innerHTML = g.getOption('xlabel');
  }
  if (this.ylabel_div_) {
    this.ylabel_div_.children[0].children[0].innerHTML = g.getOption('ylabel');
  }
  if (this.y2label_div_) {
    this.y2label_div_.children[0].children[0].innerHTML = g.getOption('y2label');
  }
};

chart_labels.prototype.clearChart = function() {
};

chart_labels.prototype.destroy = function() {
  this.detachLabels_();
};


return chart_labels;
})();

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */
/*global Dygraph:false */

Dygraph.Plugins.Grid = (function() {

/*

Current bits of jankiness:
- Direct layout access
- Direct area access

*/

"use strict";


/**
 * Draws the gridlines, i.e. the gray horizontal & vertical lines running the
 * length of the chart.
 *
 * @constructor
 */
var grid = function() {
};

grid.prototype.toString = function() {
  return "Gridline Plugin";
};

grid.prototype.activate = function(g) {
  return {
    willDrawChart: this.willDrawChart
  };
};

grid.prototype.willDrawChart = function(e) {
  // Draw the new X/Y grid. Lines appear crisper when pixels are rounded to
  // half-integers. This prevents them from drawing in two rows/cols.
  var g = e.dygraph;
  var ctx = e.drawingContext;
  var layout = g.layout_;
  var area = e.dygraph.plotter_.area;

  function halfUp(x)  { return Math.round(x) + 0.5; }
  function halfDown(y){ return Math.round(y) - 0.5; }

  var x, y, i, ticks;
  if (g.getOption('drawYGrid')) {
    var axes = ["y", "y2"];
    var strokeStyles = [], lineWidths = [], drawGrid = [], stroking = [], strokePattern = [];
    for (var i = 0; i < axes.length; i++) {
      drawGrid[i] = g.getOptionForAxis("drawGrid", axes[i]);
      if (drawGrid[i]) {
        strokeStyles[i] = g.getOptionForAxis('gridLineColor', axes[i]);
        lineWidths[i] = g.getOptionForAxis('gridLineWidth', axes[i]);
        strokePattern[i] = g.getOptionForAxis('gridLinePattern', axes[i]);
        stroking[i] = strokePattern[i] && (strokePattern[i].length >= 2);
      }
    }
    ticks = layout.yticks;
    ctx.save();
    // draw grids for the different y axes
    for (i = 0; i < ticks.length; i++) {
      var axis = ticks[i][0];
      if(drawGrid[axis]) {
        if (stroking[axis]) {
          ctx.installPattern(strokePattern[axis]);
        }
        ctx.strokeStyle = strokeStyles[axis];
        ctx.lineWidth = lineWidths[axis];

        x = halfUp(area.x);
        y = halfDown(area.y + ticks[i][1] * area.h);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + area.w, y);
        ctx.closePath();
        ctx.stroke();

        if (stroking[axis]) {
          ctx.uninstallPattern();
        }
      }
    }
    ctx.restore();
  }

  // draw grid for x axis
  if (g.getOption('drawXGrid') && g.getOptionForAxis("drawGrid", 'x')) {
    ticks = layout.xticks;
    ctx.save();
    var strokePattern = g.getOptionForAxis('gridLinePattern', 'x');
    var stroking = strokePattern && (strokePattern.length >= 2);
    if (stroking) {
      ctx.installPattern(strokePattern);
    }
    ctx.strokeStyle = g.getOptionForAxis('gridLineColor', 'x');
    ctx.lineWidth = g.getOptionForAxis('gridLineWidth', 'x');
    for (i = 0; i < ticks.length; i++) {
      x = halfUp(area.x + ticks[i][0] * area.w);
      y = halfDown(area.y + area.h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, area.y);
      ctx.closePath();
      ctx.stroke();
    }
    if (stroking) {
      ctx.uninstallPattern();
    }
    ctx.restore();
  }
};

grid.prototype.destroy = function() {
};

return grid;

})();

/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */
/*global Dygraph:false */

Dygraph.Plugins.Legend = (function() {
/*

Current bits of jankiness:
- Uses two private APIs:
    1. Dygraph.optionsViewForAxis_
    2. dygraph.plotter_.area
- Registers for a "predraw" event, which should be renamed.
- I call calculateEmWidthInDiv more often than needed.

*/

/*jshint globalstrict: true */
/*global Dygraph:false */
"use strict";


/**
 * Creates the legend, which appears when the user hovers over the chart.
 * The legend can be either a user-specified or generated div.
 *
 * @constructor
 */
var legend = function() {
  this.legend_div_ = null;
  this.is_generated_div_ = false;  // do we own this div, or was it user-specified?
};

legend.prototype.toString = function() {
  return "Legend Plugin";
};

// (defined below)
var generateLegendHTML, generateLegendDashHTML;

/**
 * This is called during the dygraph constructor, after options have been set
 * but before the data is available.
 *
 * Proper tasks to do here include:
 * - Reading your own options
 * - DOM manipulation
 * - Registering event listeners
 *
 * @param {Dygraph} g Graph instance.
 * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
 */
legend.prototype.activate = function(g) {
  var div;
  var divWidth = g.getOption('labelsDivWidth');

  var userLabelsDiv = g.getOption('labelsDiv');
  if (userLabelsDiv && null !== userLabelsDiv) {
    if (typeof(userLabelsDiv) == "string" || userLabelsDiv instanceof String) {
      div = document.getElementById(userLabelsDiv);
    } else {
      div = userLabelsDiv;
    }
  } else {
    // Default legend styles. These can be overridden in CSS by adding
    // "!important" after your rule, e.g. "left: 30px !important;"
    var messagestyle = {
      "position": "absolute",
      "fontSize": "14px",
      "zIndex": 10,
      "width": divWidth + "px",
      "top": "0px",
      "left": (g.size().width - divWidth - 2) + "px",
      "background": "white",
      "lineHeight": "normal",
      "textAlign": "left",
      "overflow": "hidden"};

    // TODO(danvk): get rid of labelsDivStyles? CSS is better.
    Dygraph.update(messagestyle, g.getOption('labelsDivStyles'));
    div = document.createElement("div");
    div.className = "dygraph-legend";
    for (var name in messagestyle) {
      if (!messagestyle.hasOwnProperty(name)) continue;

      try {
        div.style[name] = messagestyle[name];
      } catch (e) {
        this.warn("You are using unsupported css properties for your " +
            "browser in labelsDivStyles");
      }
    }

    // TODO(danvk): come up with a cleaner way to expose this.
    g.graphDiv.appendChild(div);
    this.is_generated_div_ = true;
  }

  this.legend_div_ = div;
  this.one_em_width_ = 10;  // just a guess, will be updated.

  return {
    select: this.select,
    deselect: this.deselect,
    // TODO(danvk): rethink the name "predraw" before we commit to it in any API.
    predraw: this.predraw,
    didDrawChart: this.didDrawChart
  };
};

// Needed for dashed lines.
var calculateEmWidthInDiv = function(div) {
  var sizeSpan = document.createElement('span');
  sizeSpan.setAttribute('style', 'margin: 0; padding: 0 0 0 1em; border: 0;');
  div.appendChild(sizeSpan);
  var oneEmWidth=sizeSpan.offsetWidth;
  div.removeChild(sizeSpan);
  return oneEmWidth;
};

legend.prototype.select = function(e) {
  var xValue = e.selectedX;
  var points = e.selectedPoints;

  var html = generateLegendHTML(e.dygraph, xValue, points, this.one_em_width_);
  this.legend_div_.innerHTML = html;
};

legend.prototype.deselect = function(e) {
  // Have to do this every time, since styles might have changed.
  var oneEmWidth = calculateEmWidthInDiv(this.legend_div_);
  this.one_em_width_ = oneEmWidth;

  var html = generateLegendHTML(e.dygraph, undefined, undefined, oneEmWidth);
  this.legend_div_.innerHTML = html;
};

legend.prototype.didDrawChart = function(e) {
  this.deselect(e);
};

// Right edge should be flush with the right edge of the charting area (which
// may not be the same as the right edge of the div, if we have two y-axes.
// TODO(danvk): is any of this really necessary? Could just set "right" in "activate".
/**
 * Position the labels div so that:
 * - its right edge is flush with the right edge of the charting area
 * - its top edge is flush with the top edge of the charting area
 * @private
 */
legend.prototype.predraw = function(e) {
  // Don't touch a user-specified labelsDiv.
  if (!this.is_generated_div_) return;

  // TODO(danvk): only use real APIs for this.
  e.dygraph.graphDiv.appendChild(this.legend_div_);
  var area = e.dygraph.plotter_.area;
  var labelsDivWidth = e.dygraph.getOption("labelsDivWidth");
  this.legend_div_.style.left = area.x + area.w - labelsDivWidth - 1 + "px";
  this.legend_div_.style.top = area.y + "px";
  this.legend_div_.style.width = labelsDivWidth + "px";
};

/**
 * Called when dygraph.destroy() is called.
 * You should null out any references and detach any DOM elements.
 */
legend.prototype.destroy = function() {
  this.legend_div_ = null;
};

/**
 * @private
 * Generates HTML for the legend which is displayed when hovering over the
 * chart. If no selected points are specified, a default legend is returned
 * (this may just be the empty string).
 * @param { Number } [x] The x-value of the selected points.
 * @param { [Object] } [sel_points] List of selected points for the given
 * x-value. Should have properties like 'name', 'yval' and 'canvasy'.
 * @param { Number } [oneEmWidth] The pixel width for 1em in the legend. Only
 * relevant when displaying a legend with no selection (i.e. {legend:
 * 'always'}) and with dashed lines.
 */
generateLegendHTML = function(g, x, sel_points, oneEmWidth) {
  // TODO(danvk): deprecate this option in place of {legend: 'never'}
  if (g.getOption('showLabelsOnHighlight') !== true) return '';

  // If no points are selected, we display a default legend. Traditionally,
  // this has been blank. But a better default would be a conventional legend,
  // which provides essential information for a non-interactive chart.
  var html, sepLines, i, dash, strokePattern;
  var labels = g.getLabels();

  if (typeof(x) === 'undefined') {
    if (g.getOption('legend') != 'always') {
      return '';
    }

    sepLines = g.getOption('labelsSeparateLines');
    html = '';
    for (i = 1; i < labels.length; i++) {
      var series = g.getPropertiesForSeries(labels[i]);
      if (!series.visible) continue;

      if (html !== '') html += (sepLines ? '<br/>' : ' ');
      strokePattern = g.getOption("strokePattern", labels[i]);
      dash = generateLegendDashHTML(strokePattern, series.color, oneEmWidth);
      html += "<span style='font-weight: bold; color: " + series.color + ";'>" +
          dash + " " + labels[i] + "</span>";
    }
    return html;
  }

  // TODO(danvk): remove this use of a private API
  var xOptView = g.optionsViewForAxis_('x');
  var xvf = xOptView('valueFormatter');
  html = xvf(x, xOptView, labels[0], g);
  if (html !== '') {
    html += ':';
  }

  var yOptViews = [];
  var num_axes = g.numAxes();
  for (i = 0; i < num_axes; i++) {
    // TODO(danvk): remove this use of a private API
    yOptViews[i] = g.optionsViewForAxis_('y' + (i ? 1 + i : ''));
  }
  var showZeros = g.getOption("labelsShowZeroValues");
  sepLines = g.getOption("labelsSeparateLines");
  var highlightSeries = g.getHighlightSeries();
  for (i = 0; i < sel_points.length; i++) {
    var pt = sel_points[i];
    if (pt.yval === 0 && !showZeros) continue;
    if (!Dygraph.isOK(pt.canvasy)) continue;
    if (sepLines) html += "<br/>";

    var series = g.getPropertiesForSeries(pt.name);
    var yOptView = yOptViews[series.axis - 1];
    var fmtFunc = yOptView('valueFormatter');
    var yval = fmtFunc(pt.yval, yOptView, pt.name, g);

    var cls = (pt.name == highlightSeries) ? " class='highlight'" : "";

    // TODO(danvk): use a template string here and make it an attribute.
    html += "<span" + cls + ">" + " <b><span style='color: " + series.color + ";'>" +
        pt.name + "</span></b>:&nbsp;" + yval + "</span>";
  }
  return html;
};


/**
 * Generates html for the "dash" displayed on the legend when using "legend: always".
 * In particular, this works for dashed lines with any stroke pattern. It will
 * try to scale the pattern to fit in 1em width. Or if small enough repeat the
 * pattern for 1em width.
 *
 * @param strokePattern The pattern
 * @param color The color of the series.
 * @param oneEmWidth The width in pixels of 1em in the legend.
 * @private
 */
generateLegendDashHTML = function(strokePattern, color, oneEmWidth) {
  // IE 7,8 fail at these divs, so they get boring legend, have not tested 9.
  var isIE = (/MSIE/.test(navigator.userAgent) && !window.opera);
  if (isIE) return "&mdash;";

  // Easy, common case: a solid line
  if (!strokePattern || strokePattern.length <= 1) {
    return "<div style=\"display: inline-block; position: relative; " +
    "bottom: .5ex; padding-left: 1em; height: 1px; " +
    "border-bottom: 2px solid " + color + ";\"></div>";
  }

  var i, j, paddingLeft, marginRight;
  var strokePixelLength = 0, segmentLoop = 0;
  var normalizedPattern = [];
  var loop;

  // Compute the length of the pixels including the first segment twice, 
  // since we repeat it.
  for (i = 0; i <= strokePattern.length; i++) {
    strokePixelLength += strokePattern[i%strokePattern.length];
  }

  // See if we can loop the pattern by itself at least twice.
  loop = Math.floor(oneEmWidth/(strokePixelLength-strokePattern[0]));
  if (loop > 1) {
    // This pattern fits at least two times, no scaling just convert to em;
    for (i = 0; i < strokePattern.length; i++) {
      normalizedPattern[i] = strokePattern[i]/oneEmWidth;
    }
    // Since we are repeating the pattern, we don't worry about repeating the
    // first segment in one draw.
    segmentLoop = normalizedPattern.length;
  } else {
    // If the pattern doesn't fit in the legend we scale it to fit.
    loop = 1;
    for (i = 0; i < strokePattern.length; i++) {
      normalizedPattern[i] = strokePattern[i]/strokePixelLength;
    }
    // For the scaled patterns we do redraw the first segment.
    segmentLoop = normalizedPattern.length+1;
  }

  // Now make the pattern.
  var dash = "";
  for (j = 0; j < loop; j++) {
    for (i = 0; i < segmentLoop; i+=2) {
      // The padding is the drawn segment.
      paddingLeft = normalizedPattern[i%normalizedPattern.length];
      if (i < strokePattern.length) {
        // The margin is the space segment.
        marginRight = normalizedPattern[(i+1)%normalizedPattern.length];
      } else {
        // The repeated first segment has no right margin.
        marginRight = 0;
      }
      dash += "<div style=\"display: inline-block; position: relative; " +
        "bottom: .5ex; margin-right: " + marginRight + "em; padding-left: " +
        paddingLeft + "em; height: 1px; border-bottom: 2px solid " + color +
        ";\"></div>";
    }
  }
  return dash;
};


return legend;
})();

/**
 * @license
 * Copyright 2011 Paul Felix (paul.eric.felix@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */
/*global Dygraph:false,TouchEvent:false */

/**
 * @fileoverview This file contains the RangeSelector plugin used to provide
 * a timeline range selector widget for dygraphs.
 */

Dygraph.Plugins.RangeSelector = (function() {

/*jshint globalstrict: true */
/*global Dygraph:false */
"use strict";

var rangeSelector = function() {
  this.isIE_ = /MSIE/.test(navigator.userAgent) && !window.opera;
  this.hasTouchInterface_ = typeof(TouchEvent) != 'undefined';
  this.isMobileDevice_ = /mobile|android/gi.test(navigator.appVersion);
  this.interfaceCreated_ = false;
};

rangeSelector.prototype.toString = function() {
  return "RangeSelector Plugin";
};

rangeSelector.prototype.activate = function(dygraph) {
  this.dygraph_ = dygraph;
  this.isUsingExcanvas_ = dygraph.isUsingExcanvas_;
  if (this.getOption_('showRangeSelector')) {
    this.createInterface_();
  }
  return {
    layout: this.reserveSpace_,
    predraw: this.renderStaticLayer_,
    didDrawChart: this.renderInteractiveLayer_
  };
};

rangeSelector.prototype.destroy = function() {
  this.bgcanvas_ = null;
  this.fgcanvas_ = null;
  this.leftZoomHandle_ = null;
  this.rightZoomHandle_ = null;
  this.iePanOverlay_ = null;
};

//------------------------------------------------------------------
// Private methods
//------------------------------------------------------------------

rangeSelector.prototype.getOption_ = function(name) {
  return this.dygraph_.getOption(name);
};

rangeSelector.prototype.setDefaultOption_ = function(name, value) {
  return this.dygraph_.attrs_[name] = value;
};

/**
 * @private
 * Creates the range selector elements and adds them to the graph.
 */
rangeSelector.prototype.createInterface_ = function() {
  this.createCanvases_();
  if (this.isUsingExcanvas_) {
    this.createIEPanOverlay_();
  }
  this.createZoomHandles_();
  this.initInteraction_();

  // Range selector and animatedZooms have a bad interaction. See issue 359.
  if (this.getOption_('animatedZooms')) {
    this.dygraph_.warn('Animated zooms and range selector are not compatible; disabling animatedZooms.');
    this.dygraph_.updateOptions({animatedZooms: false}, true);
  }

  this.interfaceCreated_ = true;
  this.addToGraph_();
};

/**
 * @private
 * Adds the range selector to the graph.
 */
rangeSelector.prototype.addToGraph_ = function() {
  var graphDiv = this.graphDiv_ = this.dygraph_.graphDiv;
  graphDiv.appendChild(this.bgcanvas_);
  graphDiv.appendChild(this.fgcanvas_);
  graphDiv.appendChild(this.leftZoomHandle_);
  graphDiv.appendChild(this.rightZoomHandle_);
};

/**
 * @private
 * Removes the range selector from the graph.
 */
rangeSelector.prototype.removeFromGraph_ = function() {
  var graphDiv = this.graphDiv_;
  graphDiv.removeChild(this.bgcanvas_);
  graphDiv.removeChild(this.fgcanvas_);
  graphDiv.removeChild(this.leftZoomHandle_);
  graphDiv.removeChild(this.rightZoomHandle_);
  this.graphDiv_ = null;
};

/**
 * @private
 * Called by Layout to allow range selector to reserve its space.
 */
rangeSelector.prototype.reserveSpace_ = function(e) {
  if (this.getOption_('showRangeSelector')) {
    e.reserveSpaceBottom(this.getOption_('rangeSelectorHeight') + 4);
  }
};

/**
 * @private
 * Renders the static portion of the range selector at the predraw stage.
 */
rangeSelector.prototype.renderStaticLayer_ = function() {
  if (!this.updateVisibility_()) {
    return;
  }
  this.resize_();
  this.drawStaticLayer_();
};

/**
 * @private
 * Renders the interactive portion of the range selector after the chart has been drawn.
 */
rangeSelector.prototype.renderInteractiveLayer_ = function() {
  if (!this.updateVisibility_() || this.isChangingRange_) {
    return;
  }
  this.placeZoomHandles_();
  this.drawInteractiveLayer_();
};

/**
 * @private
 * Check to see if the range selector is enabled/disabled and update visibility accordingly.
 */
rangeSelector.prototype.updateVisibility_ = function() {
  var enabled = this.getOption_('showRangeSelector');
  if (enabled) {
    if (!this.interfaceCreated_) {
      this.createInterface_();
    } else if (!this.graphDiv_ || !this.graphDiv_.parentNode) {
      this.addToGraph_();
    }
  } else if (this.graphDiv_) {
    this.removeFromGraph_();
    var dygraph = this.dygraph_;
    setTimeout(function() { dygraph.width_ = 0; dygraph.resize(); }, 1);
  }
  return enabled;
};

/**
 * @private
 * Resizes the range selector.
 */
rangeSelector.prototype.resize_ = function() {
  function setElementRect(canvas, rect) {
    canvas.style.top = rect.y + 'px';
    canvas.style.left = rect.x + 'px';
    canvas.width = rect.w;
    canvas.height = rect.h;
    canvas.style.width = canvas.width + 'px';    // for IE
    canvas.style.height = canvas.height + 'px';  // for IE
  }

  var plotArea = this.dygraph_.layout_.getPlotArea();
  
  var xAxisLabelHeight = 0;
  if(this.getOption_('drawXAxis')){
    xAxisLabelHeight = this.getOption_('xAxisHeight') || (this.getOption_('axisLabelFontSize') + 2 * this.getOption_('axisTickSize'));
  }
  this.canvasRect_ = {
    x: plotArea.x,
    y: plotArea.y + plotArea.h + xAxisLabelHeight + 4,
    w: plotArea.w,
    h: this.getOption_('rangeSelectorHeight')
  };

  setElementRect(this.bgcanvas_, this.canvasRect_);
  setElementRect(this.fgcanvas_, this.canvasRect_);
};

/**
 * @private
 * Creates the background and foreground canvases.
 */
rangeSelector.prototype.createCanvases_ = function() {
  this.bgcanvas_ = Dygraph.createCanvas();
  this.bgcanvas_.className = 'dygraph-rangesel-bgcanvas';
  this.bgcanvas_.style.position = 'absolute';
  this.bgcanvas_.style.zIndex = 9;
  this.bgcanvas_ctx_ = Dygraph.getContext(this.bgcanvas_);

  this.fgcanvas_ = Dygraph.createCanvas();
  this.fgcanvas_.className = 'dygraph-rangesel-fgcanvas';
  this.fgcanvas_.style.position = 'absolute';
  this.fgcanvas_.style.zIndex = 9;
  this.fgcanvas_.style.cursor = 'default';
  this.fgcanvas_ctx_ = Dygraph.getContext(this.fgcanvas_);
};

/**
 * @private
 * Creates overlay divs for IE/Excanvas so that mouse events are handled properly.
 */
rangeSelector.prototype.createIEPanOverlay_ = function() {
  this.iePanOverlay_ = document.createElement("div");
  this.iePanOverlay_.style.position = 'absolute';
  this.iePanOverlay_.style.backgroundColor = 'white';
  this.iePanOverlay_.style.filter = 'alpha(opacity=0)';
  this.iePanOverlay_.style.display = 'none';
  this.iePanOverlay_.style.cursor = 'move';
  this.fgcanvas_.appendChild(this.iePanOverlay_);
};

/**
 * @private
 * Creates the zoom handle elements.
 */
rangeSelector.prototype.createZoomHandles_ = function() {
  var img = new Image();
  img.className = 'dygraph-rangesel-zoomhandle';
  img.style.position = 'absolute';
  img.style.zIndex = 10;
  img.style.visibility = 'hidden'; // Initially hidden so they don't show up in the wrong place.
  img.style.cursor = 'col-resize';

  if (/MSIE 7/.test(navigator.userAgent)) { // IE7 doesn't support embedded src data.
    img.width = 7;
    img.height = 14;
    img.style.backgroundColor = 'white';
    img.style.border = '1px solid #333333'; // Just show box in IE7.
  } else {
    img.width = 9;
    img.height = 16;
    img.src = 'data:image/png;base64,' +
'iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAA' +
'zwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENv' +
'bW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl' +
'6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7s' +
'qSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII=';
  }

  if (this.isMobileDevice_) {
    img.width *= 2;
    img.height *= 2;
  }

  this.leftZoomHandle_ = img;
  this.rightZoomHandle_ = img.cloneNode(false);
};

/**
 * @private
 * Sets up the interaction for the range selector.
 */
rangeSelector.prototype.initInteraction_ = function() {
  var self = this;
  var topElem = this.isIE_ ? document : window;
  var clientXLast = 0;
  var handle = null;
  var isZooming = false;
  var isPanning = false;
  var dynamic = !this.isMobileDevice_ && !this.isUsingExcanvas_;

  // We cover iframes during mouse interactions. See comments in
  // dygraph-utils.js for more info on why this is a good idea.
  var tarp = new Dygraph.IFrameTarp();

  // functions, defined below.  Defining them this way (rather than with
  // "function foo() {...}" makes JSHint happy.
  var toXDataWindow, onZoomStart, onZoom, onZoomEnd, doZoom, isMouseInPanZone,
      onPanStart, onPan, onPanEnd, doPan, onCanvasHover;

  // Touch event functions
  var onZoomHandleTouchEvent, onCanvasTouchEvent, addTouchEvents;

  toXDataWindow = function(zoomHandleStatus) {
    var xDataLimits = self.dygraph_.xAxisExtremes();
    var fact = (xDataLimits[1] - xDataLimits[0])/self.canvasRect_.w;
    var xDataMin = xDataLimits[0] + (zoomHandleStatus.leftHandlePos - self.canvasRect_.x)*fact;
    var xDataMax = xDataLimits[0] + (zoomHandleStatus.rightHandlePos - self.canvasRect_.x)*fact;
    return [xDataMin, xDataMax];
  };

  onZoomStart = function(e) {
    Dygraph.cancelEvent(e);
    isZooming = true;
    clientXLast = e.clientX;
    handle = e.target ? e.target : e.srcElement;
    if (e.type === 'mousedown' || e.type === 'dragstart') {
      // These events are removed manually.
      Dygraph.addEvent(topElem, 'mousemove', onZoom);
      Dygraph.addEvent(topElem, 'mouseup', onZoomEnd);
    }
    self.fgcanvas_.style.cursor = 'col-resize';
    tarp.cover();
    return true;
  };

  onZoom = function(e) {
    if (!isZooming) {
      return false;
    }
    Dygraph.cancelEvent(e);

    var delX = e.clientX - clientXLast;
    if (Math.abs(delX) < 4) {
      return true;
    }
    clientXLast = e.clientX;

    // Move handle.
    var zoomHandleStatus = self.getZoomHandleStatus_();
    var newPos;
    if (handle == self.leftZoomHandle_) {
      newPos = zoomHandleStatus.leftHandlePos + delX;
      newPos = Math.min(newPos, zoomHandleStatus.rightHandlePos - handle.width - 3);
      newPos = Math.max(newPos, self.canvasRect_.x);
    } else {
      newPos = zoomHandleStatus.rightHandlePos + delX;
      newPos = Math.min(newPos, self.canvasRect_.x + self.canvasRect_.w);
      newPos = Math.max(newPos, zoomHandleStatus.leftHandlePos + handle.width + 3);
    }
    var halfHandleWidth = handle.width/2;
    handle.style.left = (newPos - halfHandleWidth) + 'px';
    self.drawInteractiveLayer_();

    // Zoom on the fly (if not using excanvas).
    if (dynamic) {
      doZoom();
    }
    return true;
  };

  onZoomEnd = function(e) {
    if (!isZooming) {
      return false;
    }
    isZooming = false;
    tarp.uncover();
    Dygraph.removeEvent(topElem, 'mousemove', onZoom);
    Dygraph.removeEvent(topElem, 'mouseup', onZoomEnd);
    self.fgcanvas_.style.cursor = 'default';

    // If using excanvas, Zoom now.
    if (!dynamic) {
      doZoom();
    }
    return true;
  };

  doZoom = function() {
    try {
      var zoomHandleStatus = self.getZoomHandleStatus_();
      self.isChangingRange_ = true;
      if (!zoomHandleStatus.isZoomed) {
        self.dygraph_.resetZoom();
      } else {
        var xDataWindow = toXDataWindow(zoomHandleStatus);
        self.dygraph_.doZoomXDates_(xDataWindow[0], xDataWindow[1]);
      }
    } finally {
      self.isChangingRange_ = false;
    }
  };

  isMouseInPanZone = function(e) {
    if (self.isUsingExcanvas_) {
        return e.srcElement == self.iePanOverlay_;
    } else {
      var rect = self.leftZoomHandle_.getBoundingClientRect();
      var leftHandleClientX = rect.left + rect.width/2;
      rect = self.rightZoomHandle_.getBoundingClientRect();
      var rightHandleClientX = rect.left + rect.width/2;
      return (e.clientX > leftHandleClientX && e.clientX < rightHandleClientX);
    }
  };

  onPanStart = function(e) {
    if (!isPanning && isMouseInPanZone(e) && self.getZoomHandleStatus_().isZoomed) {
      Dygraph.cancelEvent(e);
      isPanning = true;
      clientXLast = e.clientX;
      if (e.type === 'mousedown') {
        // These events are removed manually.
        Dygraph.addEvent(topElem, 'mousemove', onPan);
        Dygraph.addEvent(topElem, 'mouseup', onPanEnd);
      }
      return true;
    }
    return false;
  };

  onPan = function(e) {
    if (!isPanning) {
      return false;
    }
    Dygraph.cancelEvent(e);

    var delX = e.clientX - clientXLast;
    if (Math.abs(delX) < 4) {
      return true;
    }
    clientXLast = e.clientX;

    // Move range view
    var zoomHandleStatus = self.getZoomHandleStatus_();
    var leftHandlePos = zoomHandleStatus.leftHandlePos;
    var rightHandlePos = zoomHandleStatus.rightHandlePos;
    var rangeSize = rightHandlePos - leftHandlePos;
    if (leftHandlePos + delX <= self.canvasRect_.x) {
      leftHandlePos = self.canvasRect_.x;
      rightHandlePos = leftHandlePos + rangeSize;
    } else if (rightHandlePos + delX >= self.canvasRect_.x + self.canvasRect_.w) {
      rightHandlePos = self.canvasRect_.x + self.canvasRect_.w;
      leftHandlePos = rightHandlePos - rangeSize;
    } else {
      leftHandlePos += delX;
      rightHandlePos += delX;
    }
    var halfHandleWidth = self.leftZoomHandle_.width/2;
    self.leftZoomHandle_.style.left = (leftHandlePos - halfHandleWidth) + 'px';
    self.rightZoomHandle_.style.left = (rightHandlePos - halfHandleWidth) + 'px';
    self.drawInteractiveLayer_();

    // Do pan on the fly (if not using excanvas).
    if (dynamic) {
      doPan();
    }
    return true;
  };

  onPanEnd = function(e) {
    if (!isPanning) {
      return false;
    }
    isPanning = false;
    Dygraph.removeEvent(topElem, 'mousemove', onPan);
    Dygraph.removeEvent(topElem, 'mouseup', onPanEnd);
    // If using excanvas, do pan now.
    if (!dynamic) {
      doPan();
    }
    return true;
  };

  doPan = function() {
    try {
      self.isChangingRange_ = true;
      self.dygraph_.dateWindow_ = toXDataWindow(self.getZoomHandleStatus_());
      self.dygraph_.drawGraph_(false);
    } finally {
      self.isChangingRange_ = false;
    }
  };

  onCanvasHover = function(e) {
    if (isZooming || isPanning) {
      return;
    }
    var cursor = isMouseInPanZone(e) ? 'move' : 'default';
    if (cursor != self.fgcanvas_.style.cursor) {
      self.fgcanvas_.style.cursor = cursor;
    }
  };

  onZoomHandleTouchEvent = function(e) {
    if (e.type == 'touchstart' && e.targetTouches.length == 1) {
      if (onZoomStart(e.targetTouches[0])) {
        Dygraph.cancelEvent(e);
      }
    } else if (e.type == 'touchmove' && e.targetTouches.length == 1) {
      if (onZoom(e.targetTouches[0])) {
        Dygraph.cancelEvent(e);
      }
    } else {
      onZoomEnd(e);
    }
  };

  onCanvasTouchEvent = function(e) {
    if (e.type == 'touchstart' && e.targetTouches.length == 1) {
      if (onPanStart(e.targetTouches[0])) {
        Dygraph.cancelEvent(e);
      }
    } else if (e.type == 'touchmove' && e.targetTouches.length == 1) {
      if (onPan(e.targetTouches[0])) {
        Dygraph.cancelEvent(e);
      }
    } else {
      onPanEnd(e);
    }
  };

  addTouchEvents = function(elem, fn) {
    var types = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    for (var i = 0; i < types.length; i++) {
      self.dygraph_.addAndTrackEvent(elem, types[i], fn);
    }
  };

  this.setDefaultOption_('interactionModel', Dygraph.Interaction.dragIsPanInteractionModel);
  this.setDefaultOption_('panEdgeFraction', 0.0001);

  var dragStartEvent = window.opera ? 'mousedown' : 'dragstart';
  this.dygraph_.addAndTrackEvent(this.leftZoomHandle_, dragStartEvent, onZoomStart);
  this.dygraph_.addAndTrackEvent(this.rightZoomHandle_, dragStartEvent, onZoomStart);

  if (this.isUsingExcanvas_) {
    this.dygraph_.addAndTrackEvent(this.iePanOverlay_, 'mousedown', onPanStart);
  } else {
    this.dygraph_.addAndTrackEvent(this.fgcanvas_, 'mousedown', onPanStart);
    this.dygraph_.addAndTrackEvent(this.fgcanvas_, 'mousemove', onCanvasHover);
  }

  // Touch events
  if (this.hasTouchInterface_) {
    addTouchEvents(this.leftZoomHandle_, onZoomHandleTouchEvent);
    addTouchEvents(this.rightZoomHandle_, onZoomHandleTouchEvent);
    addTouchEvents(this.fgcanvas_, onCanvasTouchEvent);
  }
};

/**
 * @private
 * Draws the static layer in the background canvas.
 */
rangeSelector.prototype.drawStaticLayer_ = function() {
  var ctx = this.bgcanvas_ctx_;
  ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
  try {
    this.drawMiniPlot_();
  } catch(ex) {
    Dygraph.warn(ex);
  }

  var margin = 0.5;
  this.bgcanvas_ctx_.lineWidth = 1;
  ctx.strokeStyle = 'gray';
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, this.canvasRect_.h-margin);
  ctx.lineTo(this.canvasRect_.w-margin, this.canvasRect_.h-margin);
  ctx.lineTo(this.canvasRect_.w-margin, margin);
  ctx.stroke();
};


/**
 * @private
 * Draws the mini plot in the background canvas.
 */
rangeSelector.prototype.drawMiniPlot_ = function() {
  var fillStyle = this.getOption_('rangeSelectorPlotFillColor');
  var strokeStyle = this.getOption_('rangeSelectorPlotStrokeColor');
  if (!fillStyle && !strokeStyle) {
    return;
  }

  var stepPlot = this.getOption_('stepPlot');

  var combinedSeriesData = this.computeCombinedSeriesAndLimits_();
  var yRange = combinedSeriesData.yMax - combinedSeriesData.yMin;

  // Draw the mini plot.
  var ctx = this.bgcanvas_ctx_;
  var margin = 0.5;

  var xExtremes = this.dygraph_.xAxisExtremes();
  var xRange = Math.max(xExtremes[1] - xExtremes[0], 1.e-30);
  var xFact = (this.canvasRect_.w - margin)/xRange;
  var yFact = (this.canvasRect_.h - margin)/yRange;
  var canvasWidth = this.canvasRect_.w - margin;
  var canvasHeight = this.canvasRect_.h - margin;

  var prevX = null, prevY = null;

  ctx.beginPath();
  ctx.moveTo(margin, canvasHeight);
  for (var i = 0; i < combinedSeriesData.data.length; i++) {
    var dataPoint = combinedSeriesData.data[i];
    var x = ((dataPoint[0] !== null) ? ((dataPoint[0] - xExtremes[0])*xFact) : NaN);
    var y = ((dataPoint[1] !== null) ? (canvasHeight - (dataPoint[1] - combinedSeriesData.yMin)*yFact) : NaN);
    if (isFinite(x) && isFinite(y)) {
      if(prevX === null) {
        ctx.lineTo(x, canvasHeight);
      }
      else if (stepPlot) {
        ctx.lineTo(x, prevY);
      }
      ctx.lineTo(x, y);
      prevX = x;
      prevY = y;
    }
    else {
      if(prevX !== null) {
        if (stepPlot) {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, canvasHeight);
        }
        else {
          ctx.lineTo(prevX, canvasHeight);
        }
      }
      prevX = prevY = null;
    }
  }
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.closePath();

  if (fillStyle) {
    var lingrad = this.bgcanvas_ctx_.createLinearGradient(0, 0, 0, canvasHeight);
    lingrad.addColorStop(0, 'white');
    lingrad.addColorStop(1, fillStyle);
    this.bgcanvas_ctx_.fillStyle = lingrad;
    ctx.fill();
  }

  if (strokeStyle) {
    this.bgcanvas_ctx_.strokeStyle = strokeStyle;
    this.bgcanvas_ctx_.lineWidth = 1.5;
    ctx.stroke();
  }
};

/**
 * @private
 * Computes and returns the combinded series data along with min/max for the mini plot.
 * @return {Object} An object containing combinded series array, ymin, ymax.
 */
rangeSelector.prototype.computeCombinedSeriesAndLimits_ = function() {
  var data = this.dygraph_.rawData_;
  var logscale = this.getOption_('logscale');

  // Create a combined series (average of all series values).
  var combinedSeries = [];
  var sum;
  var count;
  var mutipleValues;
  var i, j, k;
  var xVal, yVal;

  // Find out if data has multiple values per datapoint.
  // Go to first data point that actually has values (see http://code.google.com/p/dygraphs/issues/detail?id=246)
  for (i = 0; i < data.length; i++) {
    if (data[i].length > 1 && data[i][1] !== null) {
      mutipleValues = typeof data[i][1] != 'number';
      if (mutipleValues) {
        sum = [];
        count = [];
        for (k = 0; k < data[i][1].length; k++) {
          sum.push(0);
          count.push(0);
        }
      }
      break;
    }
  }

  for (i = 0; i < data.length; i++) {
    var dataPoint = data[i];
    xVal = dataPoint[0];

    if (mutipleValues) {
      for (k = 0; k < sum.length; k++) {
        sum[k] = count[k] = 0;
      }
    } else {
      sum = count = 0;
    }

    for (j = 1; j < dataPoint.length; j++) {
      if (this.dygraph_.visibility()[j-1]) {
        var y;
        if (mutipleValues) {
          for (k = 0; k < sum.length; k++) {
            y = dataPoint[j][k];
            if (y === null || isNaN(y)) continue;
            sum[k] += y;
            count[k]++;
          }
        } else {
          y = dataPoint[j];
          if (y === null || isNaN(y)) continue;
          sum += y;
          count++;
        }
      }
    }

    if (mutipleValues) {
      for (k = 0; k < sum.length; k++) {
        sum[k] /= count[k];
      }
      yVal = sum.slice(0);
    } else {
      yVal = sum/count;
    }

    combinedSeries.push([xVal, yVal]);
  }

  // Account for roll period, fractions.
  combinedSeries = this.dygraph_.rollingAverage(combinedSeries, this.dygraph_.rollPeriod_);

  if (typeof combinedSeries[0][1] != 'number') {
    for (i = 0; i < combinedSeries.length; i++) {
      yVal = combinedSeries[i][1];
      combinedSeries[i][1] = yVal[0];
    }
  }

  // Compute the y range.
  var yMin = Number.MAX_VALUE;
  var yMax = -Number.MAX_VALUE;
  for (i = 0; i < combinedSeries.length; i++) {
    yVal = combinedSeries[i][1];
    if (yVal !== null && isFinite(yVal) && (!logscale || yVal > 0)) {
      yMin = Math.min(yMin, yVal);
      yMax = Math.max(yMax, yVal);
    }
  }

  // Convert Y data to log scale if needed.
  // Also, expand the Y range to compress the mini plot a little.
  var extraPercent = 0.25;
  if (logscale) {
    yMax = Dygraph.log10(yMax);
    yMax += yMax*extraPercent;
    yMin = Dygraph.log10(yMin);
    for (i = 0; i < combinedSeries.length; i++) {
      combinedSeries[i][1] = Dygraph.log10(combinedSeries[i][1]);
    }
  } else {
    var yExtra;
    var yRange = yMax - yMin;
    if (yRange <= Number.MIN_VALUE) {
      yExtra = yMax*extraPercent;
    } else {
      yExtra = yRange*extraPercent;
    }
    yMax += yExtra;
    yMin -= yExtra;
  }

  return {data: combinedSeries, yMin: yMin, yMax: yMax};
};

/**
 * @private
 * Places the zoom handles in the proper position based on the current X data window.
 */
rangeSelector.prototype.placeZoomHandles_ = function() {
  var xExtremes = this.dygraph_.xAxisExtremes();
  var xWindowLimits = this.dygraph_.xAxisRange();
  var xRange = xExtremes[1] - xExtremes[0];
  var leftPercent = Math.max(0, (xWindowLimits[0] - xExtremes[0])/xRange);
  var rightPercent = Math.max(0, (xExtremes[1] - xWindowLimits[1])/xRange);
  var leftCoord = this.canvasRect_.x + this.canvasRect_.w*leftPercent;
  var rightCoord = this.canvasRect_.x + this.canvasRect_.w*(1 - rightPercent);
  var handleTop = Math.max(this.canvasRect_.y, this.canvasRect_.y + (this.canvasRect_.h - this.leftZoomHandle_.height)/2);
  var halfHandleWidth = this.leftZoomHandle_.width/2;
  this.leftZoomHandle_.style.left = (leftCoord - halfHandleWidth) + 'px';
  this.leftZoomHandle_.style.top = handleTop + 'px';
  this.rightZoomHandle_.style.left = (rightCoord - halfHandleWidth) + 'px';
  this.rightZoomHandle_.style.top = this.leftZoomHandle_.style.top;

  this.leftZoomHandle_.style.visibility = 'visible';
  this.rightZoomHandle_.style.visibility = 'visible';
};

/**
 * @private
 * Draws the interactive layer in the foreground canvas.
 */
rangeSelector.prototype.drawInteractiveLayer_ = function() {
  var ctx = this.fgcanvas_ctx_;
  ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
  var margin = 1;
  var width = this.canvasRect_.w - margin;
  var height = this.canvasRect_.h - margin;
  var zoomHandleStatus = this.getZoomHandleStatus_();

  ctx.strokeStyle = 'black';
  if (!zoomHandleStatus.isZoomed) {
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, margin);
    ctx.stroke();
    if (this.iePanOverlay_) {
      this.iePanOverlay_.style.display = 'none';
    }
  } else {
    var leftHandleCanvasPos = Math.max(margin, zoomHandleStatus.leftHandlePos - this.canvasRect_.x);
    var rightHandleCanvasPos = Math.min(width, zoomHandleStatus.rightHandlePos - this.canvasRect_.x);

    ctx.fillStyle = 'rgba(240, 240, 240, 0.6)';
    ctx.fillRect(0, 0, leftHandleCanvasPos, this.canvasRect_.h);
    ctx.fillRect(rightHandleCanvasPos, 0, this.canvasRect_.w - rightHandleCanvasPos, this.canvasRect_.h);

    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(leftHandleCanvasPos, margin);
    ctx.lineTo(leftHandleCanvasPos, height);
    ctx.lineTo(rightHandleCanvasPos, height);
    ctx.lineTo(rightHandleCanvasPos, margin);
    ctx.lineTo(width, margin);
    ctx.stroke();

    if (this.isUsingExcanvas_) {
      this.iePanOverlay_.style.width = (rightHandleCanvasPos - leftHandleCanvasPos) + 'px';
      this.iePanOverlay_.style.left = leftHandleCanvasPos + 'px';
      this.iePanOverlay_.style.height = height + 'px';
      this.iePanOverlay_.style.display = 'inline';
    }
  }
};

/**
 * @private
 * Returns the current zoom handle position information.
 * @return {Object} The zoom handle status.
 */
rangeSelector.prototype.getZoomHandleStatus_ = function() {
  var halfHandleWidth = this.leftZoomHandle_.width/2;
  var leftHandlePos = parseFloat(this.leftZoomHandle_.style.left) + halfHandleWidth;
  var rightHandlePos = parseFloat(this.rightZoomHandle_.style.left) + halfHandleWidth;
  return {
      leftHandlePos: leftHandlePos,
      rightHandlePos: rightHandlePos,
      isZoomed: (leftHandlePos - 1 > this.canvasRect_.x || rightHandlePos + 1 < this.canvasRect_.x+this.canvasRect_.w)
  };
};

return rangeSelector;

})();

/*global Dygraph:false */

// This file defines the ordering of the plugins.
//
// The ordering is from most-general to most-specific.
// This means that, in an event cascade, plugins which have registered for that
// event will be called in reverse order.
//
// This is most relevant for plugins which register a layout event, e.g.
// Axes, Legend and ChartLabels.

Dygraph.PLUGINS.push(
  Dygraph.Plugins.Legend,
  Dygraph.Plugins.Axes,
  Dygraph.Plugins.RangeSelector, // Has to be before ChartLabels so that its callbacks are called after ChartLabels' callbacks.
  Dygraph.Plugins.ChartLabels,
  Dygraph.Plugins.Annotations,
  Dygraph.Plugins.Grid
);

/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/*jshint globalstrict: true */
/*global Dygraph:false */

// NOTE: in addition to parsing as JS, this snippet is expected to be valid
// JSON. This assumption cannot be checked in JS, but it will be checked when
// documentation is generated by the generate-documentation.py script. For the
// most part, this just means that you should always use double quotes.
Dygraph.OPTIONS_REFERENCE =  // <JSON>
{
  "xValueParser": {
    "default": "parseFloat() or Date.parse()*",
    "labels": ["CSV parsing"],
    "type": "function(str) -> number",
    "description": "A function which parses x-values (i.e. the dependent series). Must return a number, even when the values are dates. In this case, millis since epoch are used. This is used primarily for parsing CSV data. *=Dygraphs is slightly more accepting in the dates which it will parse. See code for details."
  },
  "stackedGraph": {
    "default": "false",
    "labels": ["Data Line display"],
    "type": "boolean",
    "description": "If set, stack series on top of one another rather than drawing them independently. The first series specified in the input data will wind up on top of the chart and the last will be on bottom. NaN values are drawn as white areas without a line on top, see stackedGraphNaNFill for details."
  },
  "stackedGraphNaNFill": {
    "default": "all",
    "labels": ["Data Line display"],
    "type": "string",
    "description": "Controls handling of NaN values inside a stacked graph. NaN values are interpolated/extended for stacking purposes, but the actual point value remains NaN in the legend display. Valid option values are \"all\" (interpolate internally, repeat leftmost and rightmost value as needed), \"inside\" (interpolate internally only, use zero outside leftmost and rightmost value), and \"none\" (treat NaN as zero everywhere)."
  },
  "pointSize": {
    "default": "1",
    "labels": ["Data Line display"],
    "type": "integer",
    "description": "The size of the dot to draw on each point in pixels (see drawPoints). A dot is always drawn when a point is \"isolated\", i.e. there is a missing point on either side of it. This also controls the size of those dots."
  },
  "labelsDivStyles": {
    "default": "null",
    "labels": ["Legend"],
    "type": "{}",
    "description": "Additional styles to apply to the currently-highlighted points div. For example, { 'fontWeight': 'bold' } will make the labels bold. In general, it is better to use CSS to style the .dygraph-legend class than to use this property."
  },
  "drawPoints": {
    "default": "false",
    "labels": ["Data Line display"],
    "type": "boolean",
    "description": "Draw a small dot at each point, in addition to a line going through the point. This makes the individual data points easier to see, but can increase visual clutter in the chart. The small dot can be replaced with a custom rendering by supplying a <a href='#drawPointCallback'>drawPointCallback</a>."
  },
  "drawGapEdgePoints": {
    "default": "false",
    "labels": ["Data Line display"],
    "type": "boolean",
    "description": "Draw points at the edges of gaps in the data. This improves visibility of small data segments or other data irregularities."
  },
  "drawPointCallback": {
    "default": "null",
    "labels": ["Data Line display"],
    "type": "function(g, seriesName, canvasContext, cx, cy, color, pointSize)",
    "parameters": [
      [ "g" , "the reference graph" ],
      [ "seriesName" , "the name of the series" ],
      [ "canvasContext" , "the canvas to draw on" ],
      [ "cx" , "center x coordinate" ],
      [ "cy" , "center y coordinate" ],
      [ "color" , "series color" ],
      [ "pointSize" , "the radius of the image." ],
      [ "idx" , "the row-index of the point in the data."]
    ],
    "description": "Draw a custom item when drawPoints is enabled. Default is a small dot matching the series color. This method should constrain drawing to within pointSize pixels from (cx, cy).  Also see <a href='#drawHighlightPointCallback'>drawHighlightPointCallback</a>"
  },
  "height": {
    "default": "320",
    "labels": ["Overall display"],
    "type": "integer",
    "description": "Height, in pixels, of the chart. If the container div has been explicitly sized, this will be ignored."
  },
  "zoomCallback": {
    "default": "null",
    "labels": ["Callbacks"],
    "type": "function(minDate, maxDate, yRanges)",
    "parameters": [
      [ "minDate" , "milliseconds since epoch" ],
      [ "maxDate" , "milliseconds since epoch." ],
      [ "yRanges" , "is an array of [bottom, top] pairs, one for each y-axis." ]
    ],
    "description": "A function to call when the zoom window is changed (either by zooming in or out)."
  },
  "pointClickCallback": {
    "snippet": "function(e, point){<br>&nbsp;&nbsp;alert(point);<br>}",
    "default": "null",
    "labels": ["Callbacks", "Interactive Elements"],
    "type": "function(e, point)",
    "parameters": [
      [ "e" , "the event object for the click" ],
      [ "point" , "the point that was clicked See <a href='#point_properties'>Point properties</a> for details" ]
    ],
    "description": "A function to call when a data point is clicked. and the point that was clicked."
  },
  "colors": {
    "default": "(see description)",
    "labels": ["Data Series Colors"],
    "type": "array<string>",
    "example": "['red', '#00FF00']",
    "description": "List of colors for the data series. These can be of the form \"#AABBCC\" or \"rgb(255,100,200)\" or \"yellow\", etc. If not specified, equally-spaced points around a color wheel are used."
  },
  "connectSeparatedPoints": {
    "default": "false",
    "labels": ["Data Line display"],
    "type": "boolean",
    "description": "Usually, when Dygraphs encounters a missing value in a data series, it interprets this as a gap and draws it as such. If, instead, the missing values represents an x-value for which only a different series has data, then you'll want to connect the dots by setting this to true. To explicitly include a gap with this option set, use a value of NaN."
  },
  "highlightCallback": {
    "default": "null",
    "labels": ["Callbacks"],
    "type": "function(event, x, points, row, seriesName)",
    "description": "When set, this callback gets called every time a new point is highlighted.",
    "parameters": [
      ["event", "the JavaScript mousemove event"],
      ["x", "the x-coordinate of the highlighted points"],
      ["points", "an array of highlighted points: <code>[ {name: 'series', yval: y-value}, &hellip; ]</code>"],
      ["row", "integer index of the highlighted row in the data table, starting from 0"],
      ["seriesName", "name of the highlighted series, only present if highlightSeriesOpts is set."]
    ]
  },
  "drawHighlightPointCallback": {
    "default": "null",
    "labels": ["Data Line display"],
    "type": "function(g, seriesName, canvasContext, cx, cy, color, pointSize)",
    "parameters": [
      [ "g" , "the reference graph" ],
      [ "seriesName" , "the name of the series" ],
      [ "canvasContext" , "the canvas to draw on" ],
      [ "cx" , "center x coordinate" ],
      [ "cy" , "center y coordinate" ],
      [ "color" , "series color" ],
      [ "pointSize" , "the radius of the image." ],
      [ "idx" , "the row-index of the point in the data."]
    ],
    "description": "Draw a custom item when a point is highlighted.  Default is a small dot matching the series color. This method should constrain drawing to within pointSize pixels from (cx, cy) Also see <a href='#drawPointCallback'>drawPointCallback</a>"
  },
  "highlightSeriesOpts": {
    "default": "null",
    "labels": ["Interactive Elements"],
    "type": "Object",
    "description": "When set, the options from this object are applied to the timeseries closest to the mouse pointer for interactive highlighting. See also 'highlightCallback'. Example: highlightSeriesOpts: { strokeWidth: 3 }."
  },
  "highlightSeriesBackgroundAlpha": {
    "default": "0.5",
    "labels": ["Interactive Elements"],
    "type": "float",
    "description": "Fade the background while highlighting series. 1=fully visible background (disable fading), 0=hiddden background (show highlighted series only)."
  },
  "includeZero": {
    "default": "false",
    "labels": ["Axis display"],
    "type": "boolean",
    "description": "Usually, dygraphs will use the range of the data plus some padding to set the range of the y-axis. If this option is set, the y-axis will always include zero, typically as the lowest value. This can be used to avoid exaggerating the variance in the data"
  },
  "rollPeriod": {
    "default": "1",
    "labels": ["Error Bars", "Rolling Averages"],
    "type": "integer &gt;= 1",
    "description": "Number of days over which to average data. Discussed extensively above."
  },
  "unhighlightCallback": {
    "default": "null",
    "labels": ["Callbacks"],
    "type": "function(event)",
    "parameters": [
      [ "event" , "the mouse event" ]
    ],
    "description": "When set, this callback gets called every time the user stops highlighting any point by mousing out of the graph."
  },
  "axisTickSize": {
    "default": "3.0",
    "labels": ["Axis display"],
    "type": "number",
    "description": "The size of the line to display next to each tick mark on x- or y-axes."
  },
  "labelsSeparateLines": {
    "default": "false",
    "labels": ["Legend"],
    "type": "boolean",
    "description": "Put <code>&lt;br/&gt;</code> between lines in the label string. Often used in conjunction with <strong>labelsDiv</strong>."
  },
  "xValueFormatter": {
    "default": "",
    "labels": ["Deprecated"],
    "type": "",
    "description": "Prefer axes: { x: { valueFormatter } }"
  },
  "valueFormatter": {
    "default": "Depends on the type of your data.",
    "labels": ["Legend", "Value display/formatting"],
    "type": "function(num or millis, opts, dygraph)",
    "description": "Function to provide a custom display format for the values displayed on mouseover. This does not affect the values that appear on tick marks next to the axes. To format those, see axisLabelFormatter. This is usually set on a <a href='per-axis.html'>per-axis</a> basis. For date axes, you can call new Date(millis) to get a Date object. opts is a function you can call to access various options (e.g. opts('labelsKMB'))."
  },
  "pixelsPerYLabel": {
    "default": "",
    "labels": ["Deprecated"],
    "type": "integer",
    "description": "Prefer axes: { y: { pixelsPerLabel } }"
  },
  "annotationMouseOverHandler": {
    "default": "null",
    "labels": ["Annotations"],
    "type": "function(annotation, point, dygraph, event)",
    "description": "If provided, this function is called whenever the user mouses over an annotation."
  },
  "annotationMouseOutHandler": {
    "default": "null",
    "labels": ["Annotations"],
    "type": "function(annotation, point, dygraph, event)",
    "parameters": [
      [ "annotation" , "the annotation left" ],
      [ "point" , "the point associated with the annotation" ],
      [ "dygraph" , "the reference graph" ],
      [ "event" , "the mouse event" ]
    ],
    "description": "If provided, this function is called whenever the user mouses out of an annotation."
  },
  "annotationClickHandler": {
    "default": "null",
    "labels": ["Annotations"],
    "type": "function(annotation, point, dygraph, event)",
    "parameters": [
      [ "annotation" , "the annotation left" ],
      [ "point" , "the point associated with the annotation" ],
      [ "dygraph" , "the reference graph" ],
      [ "event" , "the mouse event" ]
    ],
    "description": "If provided, this function is called whenever the user clicks on an annotation."
  },
  "annotationDblClickHandler": {
    "default": "null",
    "labels": ["Annotations"],
    "type": "function(annotation, point, dygraph, event)",
    "parameters": [
      [ "annotation" , "the annotation left" ],
      [ "point" , "the point associated with the annotation" ],
      [ "dygraph" , "the reference graph" ],
      [ "event" , "the mouse event" ]
    ],
    "description": "If provided, this function is called whenever the user double-clicks on an annotation."
  },
  "drawCallback": {
    "default": "null",
    "labels": ["Callbacks"],
    "type": "function(dygraph, is_initial)",
    "parameters": [
      [ "dygraph" , "The graph being drawn" ],
      [ "is_initial" , "True if this is the initial draw, false for subsequent draws." ]
    ],
    "description": "When set, this callback gets called every time the dygraph is drawn. This includes the initial draw, after zooming and repeatedly while panning."
  },
  "labelsKMG2": {
    "default": "false",
    "labels": ["Value display/formatting"],
    "type": "boolean",
    "description": "Show k/M/G for kilo/Mega/Giga on y-axis. This is different than <code>labelsKMB</code> in that it uses base 2, not 10."
  },
  "delimiter": {
    "default": ",",
    "labels": ["CSV parsing"],
    "type": "string",
    "description": "The delimiter to look for when separating fields of a CSV file. Setting this to a tab is not usually necessary, since tab-delimited data is auto-detected."
  },
  "axisLabelFontSize": {
    "default": "14",
    "labels": ["Axis display"],
    "type": "integer",
    "description": "Size of the font (in pixels) to use in the axis labels, both x- and y-axis."
  },
  "underlayCallback": {
    "default": "null",
    "labels": ["Callbacks"],
    "type": "function(context, area, dygraph)",
    "parameters": [
      [ "context" , "the canvas drawing context on which to draw" ],
      [ "area" , "An object with {x,y,w,h} properties describing the drawing area." ],
      [ "dygraph" , "the reference graph" ]
    ],
    "description": "When set, this callback gets called before the chart is drawn. It details on how to use this."
  },
  "width": {
    "default": "480",
    "labels": ["Overall display"],
    "type": "integer",
    "description": "Width, in pixels, of the chart. If the container div has been explicitly sized, this will be ignored."
  },
  "interactionModel": {
    "default": "...",
    "labels": ["Interactive Elements"],
    "type": "Object",
    "description": "TODO(konigsberg): document this"
  },
  "ticker": {
    "default": "Dygraph.dateTicker or Dygraph.numericTicks",
    "labels": ["Axis display"],
    "type": "function(min, max, pixels, opts, dygraph, vals) -> [{v: ..., label: ...}, ...]",
    "parameters": [
      [ "min" , "" ],
      [ "max" , "" ],
      [ "pixels" , "" ],
      [ "opts" , "" ],
      [ "dygraph" , "the reference graph" ],
      [ "vals" , "" ]
    ],
    "description": "This lets you specify an arbitrary function to generate tick marks on an axis. The tick marks are an array of (value, label) pairs. The built-in functions go to great lengths to choose good tick marks so, if you set this option, you'll most likely want to call one of them and modify the result. See dygraph-tickers.js for an extensive discussion. This is set on a <a href='per-axis.html'>per-axis</a> basis."
  },
  "xAxisLabelWidth": {
    "default": "50",
    "labels": ["Axis display"],
    "type": "integer",
    "description": "Width, in pixels, of the x-axis labels."
  },
  "xAxisHeight": {
    "default": "(null)",
    "labels": ["Axis display"],
    "type": "integer",
    "description": "Height, in pixels, of the x-axis. If not set explicitly, this is computed based on axisLabelFontSize and axisTickSize."
  },
  "showLabelsOnHighlight": {
    "default": "true",
    "labels": ["Interactive Elements", "Legend"],
    "type": "boolean",
    "description": "Whether to show the legend upon mouseover."
  },
  "axis": {
    "default": "(none)",
    "labels": ["Axis display"],
    "type": "string or object",
    "description": "Set to either an object ({}) filled with options for this axis or to the name of an existing data series with its own axis to re-use that axis. See tests for usage."
  },
  "pixelsPerXLabel": {
    "default": "",
    "labels": ["Deprecated"],
    "type": "integer",
    "description": "Prefer axes { x: { pixelsPerLabel } }"
  },
  "pixelsPerLabel": {
    "default": "60 (x-axis) or 30 (y-axes)",
    "labels": ["Axis display", "Grid"],
    "type": "integer",
    "description": "Number of pixels to require between each x- and y-label. Larger values will yield a sparser axis with fewer ticks. This is set on a <a href='per-axis.html'>per-axis</a> basis."
  },
  "labelsDiv": {
    "default": "null",
    "labels": ["Legend"],
    "type": "DOM element or string",
    "example": "<code style='font-size: small'>document.getElementById('foo')</code>or<code>'foo'",
    "description": "Show data labels in an external div, rather than on the graph.  This value can either be a div element or a div id."
  },
  "fractions": {
    "default": "false",
    "labels": ["CSV parsing", "Error Bars"],
    "type": "boolean",
    "description": "When set, attempt to parse each cell in the CSV file as \"a/b\", where a and b are integers. The ratio will be plotted. This allows computation of Wilson confidence intervals (see below)."
  },
  "logscale": {
    "default": "false",
    "labels": ["Axis display"],
    "type": "boolean",
    "description": "When set for a y-axis, the graph shows that axis in log scale. Any values less than or equal to zero are not displayed.\n\nNot compatible with showZero, and ignores connectSeparatedPoints. Also, showing log scale with valueRanges that are less than zero will result in an unviewable graph."
  },
  "strokeWidth": {
    "default": "1.0",
    "labels": ["Data Line display"],
    "type": "float",
    "example": "0.5, 2.0",
    "description": "The width of the lines connecting data points. This can be used to increase the contrast or some graphs."
  },
  "strokePattern": {
    "default": "null",
    "labels": ["Data Line display"],
    "type": "array<integer>",
    "example": "[10, 2, 5, 2]",
    "description": "A custom pattern array where the even index is a draw and odd is a space in pixels. If null then it draws a solid line. The array should have a even length as any odd lengthed array could be expressed as a smaller even length array. This is used to create dashed lines."
  },
  "strokeBorderWidth": {
    "default": "null",
    "labels": ["Data Line display"],
    "type": "float",
    "example": "1.0",
    "description": "Draw a border around graph lines to make crossing lines more easily distinguishable. Useful for graphs with many lines."
  },
  "strokeBorderColor": {
    "default": "white",
    "labels": ["Data Line display"],
    "type": "string",
    "example": "red, #ccffdd",
    "description": "Color for the line border used if strokeBorderWidth is set."
  },
  "wilsonInterval": {
    "default": "true",
    "labels": ["Error Bars"],
    "type": "boolean",
    "description": "Use in conjunction with the \"fractions\" option. Instead of plotting +/- N standard deviations, dygraphs will compute a Wilson confidence interval and plot that. This has more reasonable behavior for ratios close to 0 or 1."
  },
  "fillGraph": {
    "default": "false",
    "labels": ["Data Line display"],
    "type": "boolean",
    "description": "Should the area underneath the graph be filled? This option is not compatible with error bars. This may be set on a <a href='per-axis.html'>per-series</a> basis."
  },
  "highlightCircleSize": {
    "default": "3",
    "labels": ["Interactive Elements"],
    "type": "integer",
    "description": "The size in pixels of the dot drawn over highlighted points."
  },
  "gridLineColor": {
    "default": "rgb(128,128,128)",
    "labels": ["Grid"],
    "type": "red, blue",
    "description": "The color of the gridlines. This may be set on a per-axis basis to define each axis' grid separately."
  },
  "visibility": {
    "default": "[true, true, ...]",
    "labels": ["Data Line display"],
    "type": "Array of booleans",
    "description": "Which series should initially be visible? Once the Dygraph has been constructed, you can access and modify the visibility of each series using the <code>visibility</code> and <code>setVisibility</code> methods."
  },
  "valueRange": {
    "default": "Full range of the input is shown",
    "labels": ["Axis display"],
    "type": "Array of two numbers",
    "example": "[10, 110]",
    "description": "Explicitly set the vertical range of the graph to [low, high]. This may be set on a per-axis basis to define each y-axis separately. If either limit is unspecified, it will be calculated automatically (e.g. [null, 30] to automatically calculate just the lower bound)"
  },
  "labelsDivWidth": {
    "default": "250",
    "labels": ["Legend"],
    "type": "integer",
    "description": "Width (in pixels) of the div which shows information on the currently-highlighted points."
  },
  "colorSaturation": {
    "default": "1.0",
    "labels": ["Data Series Colors"],
    "type": "float (0.0 - 1.0)",
    "description": "If <strong>colors</strong> is not specified, saturation of the automatically-generated data series colors."
  },
  "yAxisLabelWidth": {
    "default": "50",
    "labels": ["Axis display"],
    "type": "integer",
    "description": "Width, in pixels, of the y-axis labels. This also affects the amount of space available for a y-axis chart label."
  },
  "hideOverlayOnMouseOut": {
    "default": "true",
    "labels": ["Interactive Elements", "Legend"],
    "type": "boolean",
    "description": "Whether to hide the legend when the mouse leaves the chart area."
  },
  "yValueFormatter": {
    "default": "",
    "labels": ["Deprecated"],
    "type": "",
    "description": "Prefer axes: { y: { valueFormatter } }"
  },
  "legend": {
    "default": "onmouseover",
    "labels": ["Legend"],
    "type": "string",
    "description": "When to display the legend. By default, it only appears when a user mouses over the chart. Set it to \"always\" to always display a legend of some sort."
  },
  "labelsShowZeroValues": {
    "default": "true",
    "labels": ["Legend"],
    "type": "boolean",
    "description": "Show zero value labels in the labelsDiv."
  },
  "stepPlot": {
    "default": "false",
    "labels": ["Data Line display"],
    "type": "boolean",
    "description": "When set, display the graph as a step plot instead of a line plot. This option may either be set for the whole graph or for single series."
  },
  "labelsKMB": {
    "default": "false",
    "labels": ["Value display/formatting"],
    "type": "boolean",
    "description": "Show K/M/B for thousands/millions/billions on y-axis."
  },
  "rightGap": {
    "default": "5",
    "labels": ["Overall display"],
    "type": "integer",
    "description": "Number of pixels to leave blank at the right edge of the Dygraph. This makes it easier to highlight the right-most data point."
  },
  "avoidMinZero": {
    "default": "false",
    "labels": ["Deprecated"],
    "type": "boolean",
    "description": "Deprecated, please use yRangePad instead. When set, the heuristic that fixes the Y axis at zero for a data set with the minimum Y value of zero is disabled. \nThis is particularly useful for data sets that contain many zero values, especially for step plots which may otherwise have lines not visible running along the bottom axis."
  },
  "drawAxesAtZero": {
    "default": "false",
    "labels": ["Axis display"],
    "type": "boolean",
    "description": "When set, draw the X axis at the Y=0 position and the Y axis at the X=0 position if those positions are inside the graph's visible area. Otherwise, draw the axes at the bottom or left graph edge as usual."
  },
  "xRangePad": {
    "default": "0",
    "labels": ["Axis display"],
    "type": "float",
    "description": "Add the specified amount of extra space (in pixels) around the X-axis value range to ensure points at the edges remain visible."
  },
  "yRangePad": {
    "default": "null",
    "labels": ["Axis display"],
    "type": "float",
    "description": "If set, add the specified amount of extra space (in pixels) around the Y-axis value range to ensure points at the edges remain visible. If unset, use the traditional Y padding algorithm."
  },
  "xAxisLabelFormatter": {
    "default": "",
    "labels": ["Deprecated"],
    "type": "",
    "description": "Prefer axes { x: { axisLabelFormatter } }"
  },
  "axisLabelFormatter": {
    "default": "Depends on the data type",
    "labels": ["Axis display"],
    "type": "function(number or Date, granularity, opts, dygraph)",
    "parameters": [
      [ "number or date" , "Either a number (for a numeric axis) or a Date object (for a date axis)" ],
      [ "granularity" , "specifies how fine-grained the axis is. For date axes, this is a reference to the time granularity enumeration, defined in dygraph-tickers.js, e.g. Dygraph.WEEKLY." ],
      [ "opts" , "a function which provides access to various options on the dygraph, e.g. opts('labelsKMB')." ],
      [ "dygraph" , "the referenced graph" ]
    ],
    "description": "Function to call to format the tick values that appear along an axis. This is usually set on a <a href='per-axis.html'>per-axis</a> basis."
  },
  "clickCallback": {
    "snippet": "function(e, date_millis){<br>&nbsp;&nbsp;alert(new Date(date_millis));<br>}",
    "default": "null",
    "labels": ["Callbacks"],
    "type": "function(e, x, points)",
    "parameters": [
      [ "e" , "The event object for the click" ],
      [ "x" , "The x value that was clicked (for dates, this is milliseconds since epoch)" ],
      [ "points" , "The closest points along that date. See <a href='#point_properties'>Point properties</a> for details." ]
    ],
    "description": "A function to call when the canvas is clicked."
  },
  "yAxisLabelFormatter": {
    "default": "",
    "labels": ["Deprecated"],
    "type": "",
    "description": "Prefer axes: { y: { axisLabelFormatter } }"
  },
  "labels": {
    "default": "[\"X\", \"Y1\", \"Y2\", ...]*",
    "labels": ["Legend"],
    "type": "array<string>",
    "description": "A name for each data series, including the independent (X) series. For CSV files and DataTable objections, this is determined by context. For raw data, this must be specified. If it is not, default values are supplied and a warning is logged."
  },
  "dateWindow": {
    "default": "Full range of the input is shown",
    "labels": ["Axis display"],
    "type": "Array of two numbers",
    "example": "[<br>&nbsp;&nbsp;Date.parse('2006-01-01'),<br>&nbsp;&nbsp;(new Date()).valueOf()<br>]",
    "description": "Initially zoom in on a section of the graph. Is of the form [earliest, latest], where earliest/latest are milliseconds since epoch. If the data for the x-axis is numeric, the values in dateWindow must also be numbers."
  },
  "showRoller": {
    "default": "false",
    "labels": ["Interactive Elements", "Rolling Averages"],
    "type": "boolean",
    "description": "If the rolling average period text box should be shown."
  },
  "sigma": {
    "default": "2.0",
    "labels": ["Error Bars"],
    "type": "float",
    "description": "When errorBars is set, shade this many standard deviations above/below each point."
  },
  "customBars": {
    "default": "false",
    "labels": ["CSV parsing", "Error Bars"],
    "type": "boolean",
    "description": "When set, parse each CSV cell as \"low;middle;high\". Error bars will be drawn for each point between low and high, with the series itself going through middle."
  },
  "colorValue": {
    "default": "1.0",
    "labels": ["Data Series Colors"],
    "type": "float (0.0 - 1.0)",
    "description": "If colors is not specified, value of the data series colors, as in hue/saturation/value. (0.0-1.0, default 0.5)"
  },
  "errorBars": {
    "default": "false",
    "labels": ["CSV parsing", "Error Bars"],
    "type": "boolean",
    "description": "Does the data contain standard deviations? Setting this to true alters the input format (see above)."
  },
  "displayAnnotations": {
    "default": "false",
    "labels": ["Annotations"],
    "type": "boolean",
    "description": "Only applies when Dygraphs is used as a GViz chart. Causes string columns following a data series to be interpreted as annotations on points in that series. This is the same format used by Google's AnnotatedTimeLine chart."
  },
  "panEdgeFraction": {
    "default": "null",
    "labels": ["Axis display", "Interactive Elements"],
    "type": "float",
    "description": "A value representing the farthest a graph may be panned, in percent of the display. For example, a value of 0.1 means that the graph can only be panned 10% pased the edges of the displayed values. null means no bounds."
  },
  "title": {
    "labels": ["Chart labels"],
    "type": "string",
    "default": "null",
    "description": "Text to display above the chart. You can supply any HTML for this value, not just text. If you wish to style it using CSS, use the 'dygraph-label' or 'dygraph-title' classes."
  },
  "titleHeight": {
    "default": "18",
    "labels": ["Chart labels"],
    "type": "integer",
    "description": "Height of the chart title, in pixels. This also controls the default font size of the title. If you style the title on your own, this controls how much space is set aside above the chart for the title's div."
  },
  "xlabel": {
    "labels": ["Chart labels"],
    "type": "string",
    "default": "null",
    "description": "Text to display below the chart's x-axis. You can supply any HTML for this value, not just text. If you wish to style it using CSS, use the 'dygraph-label' or 'dygraph-xlabel' classes."
  },
  "xLabelHeight": {
    "labels": ["Chart labels"],
    "type": "integer",
    "default": "18",
    "description": "Height of the x-axis label, in pixels. This also controls the default font size of the x-axis label. If you style the label on your own, this controls how much space is set aside below the chart for the x-axis label's div."
  },
  "ylabel": {
    "labels": ["Chart labels"],
    "type": "string",
    "default": "null",
    "description": "Text to display to the left of the chart's y-axis. You can supply any HTML for this value, not just text. If you wish to style it using CSS, use the 'dygraph-label' or 'dygraph-ylabel' classes. The text will be rotated 90 degrees by default, so CSS rules may behave in unintuitive ways. No additional space is set aside for a y-axis label. If you need more space, increase the width of the y-axis tick labels using the yAxisLabelWidth option. If you need a wider div for the y-axis label, either style it that way with CSS (but remember that it's rotated, so width is controlled by the 'height' property) or set the yLabelWidth option."
  },
  "y2label": {
    "labels": ["Chart labels"],
    "type": "string",
    "default": "null",
    "description": "Text to display to the right of the chart's secondary y-axis. This label is only displayed if a secondary y-axis is present. See <a href='http://dygraphs.com/tests/two-axes.html'>this test</a> for an example of how to do this. The comments for the 'ylabel' option generally apply here as well. This label gets a 'dygraph-y2label' instead of a 'dygraph-ylabel' class."
  },
  "yLabelWidth": {
    "labels": ["Chart labels"],
    "type": "integer",
    "default": "18",
    "description": "Width of the div which contains the y-axis label. Since the y-axis label appears rotated 90 degrees, this actually affects the height of its div."
  },
  "isZoomedIgnoreProgrammaticZoom" : {
    "default": "false",
    "labels": ["Zooming"],
    "type": "boolean",
    "description" : "When this option is passed to updateOptions() along with either the <code>dateWindow</code> or <code>valueRange</code> options, the zoom flags are not changed to reflect a zoomed state. This is primarily useful for when the display area of a chart is changed programmatically and also where manual zooming is allowed and use is made of the <code>isZoomed</code> method to determine this."
  },
  "drawXGrid": {
    "default": "true",
    "labels": ["Grid","Deprecated"],
    "type": "boolean",
    "description" : "Use the per-axis option drawGrid instead. Whether to display vertical gridlines under the chart."
  },
  "drawYGrid": {
    "default": "true",
    "labels": ["Grid","Deprecated"],
    "type": "boolean",
    "description" : "Use the per-axis option drawGrid instead. Whether to display horizontal gridlines under the chart."
  },
  "drawGrid": {
    "default": "true for x and y, false for y2",
    "labels": ["Grid"],
    "type": "boolean",
    "description" : "Whether to display gridlines in the chart. This may be set on a per-axis basis to define the visibility of each axis' grid separately."
  },
  "independentTicks": {
    "default": "true for y, false for y2",
    "labels": ["Axis display", "Grid"],
    "type": "boolean",
    "description" : "Only valid for y and y2, has no effect on x: This option defines whether the y axes should align their ticks or if they should be independent. Possible combinations: 1.) y=true, y2=false (default): y is the primary axis and the y2 ticks are aligned to the the ones of y. (only 1 grid) 2.) y=false, y2=true: y2 is the primary axis and the y ticks are aligned to the the ones of y2. (only 1 grid) 3.) y=true, y2=true: Both axis are independent and have their own ticks. (2 grids) 4.) y=false, y2=false: Invalid configuration causes an error."
  },
  "drawXAxis": {
    "default": "true",
    "labels": ["Axis display"],
    "type": "boolean",
    "description" : "Whether to draw the x-axis. Setting this to false also prevents x-axis ticks from being drawn and reclaims the space for the chart grid/lines."
  },
  "drawYAxis": {
    "default": "true",
    "labels": ["Axis display"],
    "type": "boolean",
    "description" : "Whether to draw the y-axis. Setting this to false also prevents y-axis ticks from being drawn and reclaims the space for the chart grid/lines."
  },
  "gridLineWidth": {
    "default": "0.3",
    "labels": ["Grid"],
    "type": "float",
    "description" : "Thickness (in pixels) of the gridlines drawn under the chart. The vertical/horizontal gridlines can be turned off entirely by using the drawXGrid and drawYGrid options. This may be set on a per-axis basis to define each axis' grid separately."
  },
  "axisLineWidth": {
    "default": "0.3",
    "labels": ["Axis display"],
    "type": "float",
    "description" : "Thickness (in pixels) of the x- and y-axis lines."
  },
  "axisLineColor": {
    "default": "black",
    "labels": ["Axis display"],
    "type": "string",
    "description" : "Color of the x- and y-axis lines. Accepts any value which the HTML canvas strokeStyle attribute understands, e.g. 'black' or 'rgb(0, 100, 255)'."
  },
  "fillAlpha": {
    "default": "0.15",
    "labels": ["Error Bars", "Data Series Colors"],
    "type": "float (0.0 - 1.0)",
    "description" : "Error bars (or custom bars) for each series are drawn in the same color as the series, but with partial transparency. This sets the transparency. A value of 0.0 means that the error bars will not be drawn, whereas a value of 1.0 means that the error bars will be as dark as the line for the series itself. This can be used to produce chart lines whose thickness varies at each point."
  },
  "axisLabelColor": {
    "default": "black",
    "labels": ["Axis display"],
    "type": "string",
    "description" : "Color for x- and y-axis labels. This is a CSS color string."
  },
  "axisLabelWidth": {
    "default": "50",
    "labels": ["Axis display", "Chart labels"],
    "type": "integer",
    "description" : "Width (in pixels) of the containing divs for x- and y-axis labels. For the y-axis, this also controls "
  },
  "sigFigs" : {
    "default": "null",
    "labels": ["Value display/formatting"],
    "type": "integer",
    "description": "By default, dygraphs displays numbers with a fixed number of digits after the decimal point. If you'd prefer to have a fixed number of significant figures, set this option to that number of sig figs. A value of 2, for instance, would cause 1 to be display as 1.0 and 1234 to be displayed as 1.23e+3."
  },
  "digitsAfterDecimal" : {
    "default": "2",
    "labels": ["Value display/formatting"],
    "type": "integer",
    "description": "Unless it's run in scientific mode (see the <code>sigFigs</code> option), dygraphs displays numbers with <code>digitsAfterDecimal</code> digits after the decimal point. Trailing zeros are not displayed, so with a value of 2 you'll get '0', '0.1', '0.12', '123.45' but not '123.456' (it will be rounded to '123.46'). Numbers with absolute value less than 0.1^digitsAfterDecimal (i.e. those which would show up as '0.00') will be displayed in scientific notation."
  },
  "maxNumberWidth" : {
    "default": "6",
    "labels": ["Value display/formatting"],
    "type": "integer",
    "description": "When displaying numbers in normal (not scientific) mode, large numbers will be displayed with many trailing zeros (e.g. 100000000 instead of 1e9). This can lead to unwieldy y-axis labels. If there are more than <code>maxNumberWidth</code> digits to the left of the decimal in a number, dygraphs will switch to scientific notation, even when not operating in scientific mode. If you'd like to see all those digits, set this to something large, like 20 or 30."
  },
  "file": {
    "default": "(set when constructed)",
    "labels": ["Data"],
    "type": "string (URL of CSV or CSV), GViz DataTable or 2D Array",
    "description": "Sets the data being displayed in the chart. This can only be set when calling updateOptions; it cannot be set from the constructor. For a full description of valid data formats, see the <a href='http://dygraphs.com/data.html'>Data Formats</a> page."
  },
  "timingName": {
    "default": "null",
    "labels": [ "Debugging" ],
    "type": "string",
    "description": "Set this option to log timing information. The value of the option will be logged along with the timimg, so that you can distinguish multiple dygraphs on the same page."
  },
  "showRangeSelector": {
    "default": "false",
    "labels": ["Interactive Elements"],
    "type": "boolean",
    "description": "Show or hide the range selector widget."
  },
  "rangeSelectorHeight": {
    "default": "40",
    "labels": ["Interactive Elements"],
    "type": "integer",
    "description": "Height, in pixels, of the range selector widget. This option can only be specified at Dygraph creation time."
  },
  "rangeSelectorPlotStrokeColor": {
    "default": "#808FAB",
    "labels": ["Interactive Elements"],
    "type": "string",
    "description": "The range selector mini plot stroke color. This can be of the form \"#AABBCC\" or \"rgb(255,100,200)\" or \"yellow\". You can also specify null or \"\" to turn off stroke."
  },
  "rangeSelectorPlotFillColor": {
    "default": "#A7B1C4",
    "labels": ["Interactive Elements"],
    "type": "string",
    "description": "The range selector mini plot fill color. This can be of the form \"#AABBCC\" or \"rgb(255,100,200)\" or \"yellow\". You can also specify null or \"\" to turn off fill."
  },
  "animatedZooms": {
    "default": "false",
    "labels": ["Interactive Elements"],
    "type": "boolean",
    "description": "Set this option to animate the transition between zoom windows. Applies to programmatic and interactive zooms. Note that if you also set a drawCallback, it will be called several times on each zoom. If you set a zoomCallback, it will only be called after the animation is complete."
  },
  "plotter": {
    "default": "[DygraphCanvasRenderer.Plotters.fillPlotter, DygraphCanvasRenderer.Plotters.errorPlotter, DygraphCanvasRenderer.Plotters.linePlotter]",
    "labels": ["Data Line display"],
    "type": "array or function",
    "description": "A function (or array of functions) which plot each data series on the chart. TODO(danvk): more details! May be set per-series."
  },
  "series": {
    "default": "null",
    "labels": ["Series"],
    "type": "Object",
    "description": "Defines per-series options. Its keys match the y-axis label names, and the values are dictionaries themselves that contain options specific to that series. When this option is missing, it falls back on the old-style of per-series options comingled with global options."
  },
  "plugins": {
    "default": "[]",
    "labels": ["Configuration"],
    "type": "Array<plugin>",
    "description": "Defines per-graph plug-ins. Useful for per-graph customization"
  }
}
;  // </JSON>
// NOTE: in addition to parsing as JS, this snippet is expected to be valid
// JSON. This assumption cannot be checked in JS, but it will be checked when
// documentation is generated by the generate-documentation.py script. For the
// most part, this just means that you should always use double quotes.

// Do a quick sanity check on the options reference.
(function() {
  "use strict";
  var warn = function(msg) { if (window.console) window.console.warn(msg); };
  var flds = ['type', 'default', 'description'];
  var valid_cats = [
   'Annotations',
   'Axis display',
   'Chart labels',
   'CSV parsing',
   'Callbacks',
   'Data',
   'Data Line display',
   'Data Series Colors',
   'Error Bars',
   'Grid',
   'Interactive Elements',
   'Legend',
   'Overall display',
   'Rolling Averages',
   'Series',
   'Value display/formatting',
   'Zooming',
   'Debugging',
   'Configuration',
   'Deprecated'
  ];
  var i;
  var cats = {};
  for (i = 0; i < valid_cats.length; i++) cats[valid_cats[i]] = true;

  for (var k in Dygraph.OPTIONS_REFERENCE) {
    if (!Dygraph.OPTIONS_REFERENCE.hasOwnProperty(k)) continue;
    var op = Dygraph.OPTIONS_REFERENCE[k];
    for (i = 0; i < flds.length; i++) {
      if (!op.hasOwnProperty(flds[i])) {
        warn('Option ' + k + ' missing "' + flds[i] + '" property');
      } else if (typeof(op[flds[i]]) != 'string') {
        warn(k + '.' + flds[i] + ' must be of type string');
      }
    }
    var labels = op.labels;
    if (typeof(labels) !== 'object') {
      warn('Option "' + k + '" is missing a "labels": [...] option');
    } else {
      for (i = 0; i < labels.length; i++) {
        if (!cats.hasOwnProperty(labels[i])) {
          warn('Option "' + k + '" has label "' + labels[i] +
               '", which is invalid.');
        }
      }
    }
  }
})();

var temp = {};
temp.Dygraph = window.Dygraph || Dygraph;
module.exports = temp;

